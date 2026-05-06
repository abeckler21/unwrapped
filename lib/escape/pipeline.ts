import { SPOTIFY_API_BASE_URL } from "@/lib/spotify/constants"
import type { BubbleScoreResult } from "@/lib/analysis/bubble-score"
import type { SpotifyProfile } from "@/lib/types/spotify"
import { detectGapGenres } from "@/lib/escape/genres"

// ── Public types ──────────────────────────────────────────────────────────────

export type EscapeRecommendation = {
  gapGenre: string
  /**
   * "gap"   — artist is in a genre entirely absent from the user's profile
   * "depth" — artist is in a genre the user already listens to, but buried
   *           at very low popularity the algorithm never surfaces
   */
  mode: "gap" | "depth"
  artist: {
    id: string
    name: string
    genres: string[]
    popularity: number
    followers: number
    imageUrl: string | null
    spotifyUrl: string
  }
  track: {
    id: string
    uri: string
    name: string
    albumName: string
    albumImageUrl: string | null
    durationMs: number
    previewUrl: string | null
  }
  /** 0–100: higher = less likely to be surfaced by the algorithm */
  antiAlgorithmScore: number
}

// ── Internal Spotify response shapes ─────────────────────────────────────────

type SpotifyArtistResult = {
  id: string
  name: string
  genres?: string[]
  popularity: number
  followers?: { total: number }
  images?: Array<{ url: string }>
  external_urls?: { spotify: string }
}

type SpotifyTrackResult = {
  id: string
  uri: string
  name: string
  duration_ms: number
  preview_url: string | null
  album: {
    name: string
    images?: Array<{ url: string }>
  }
}

// ── Spotify helpers ───────────────────────────────────────────────────────────

async function spotifyGet<T>(path: string, accessToken: string): Promise<T | null> {
  try {
    const res = await fetch(`${SPOTIFY_API_BASE_URL}${path}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

async function searchArtistsByGenre(
  genre: string,
  accessToken: string,
): Promise<SpotifyArtistResult[]> {
  const params = new URLSearchParams({ q: `genre:"${genre}"`, type: "artist", limit: "20" })
  const data = await spotifyGet<{ artists: { items: SpotifyArtistResult[] } }>(
    `/search?${params}`,
    accessToken,
  )
  return data?.artists?.items ?? []
}

async function fetchArtistTopTrack(
  artistId: string,
  market: string,
  accessToken: string,
): Promise<SpotifyTrackResult | null> {
  const safeMarket = /^[A-Z]{2}$/.test(market) ? market : "US"
  const data = await spotifyGet<{ tracks: SpotifyTrackResult[] }>(
    `/artists/${artistId}/top-tracks?market=${safeMarket}`,
    accessToken,
  )
  return data?.tracks?.[0] ?? null
}

// ── Scoring ───────────────────────────────────────────────────────────────────

/**
 * Anti-algorithm score for gap mode (0–100).
 * Rewards: lower popularity (among the 20–55 window), genres far from the user's.
 */
function scoreArtist(
  artist: SpotifyArtistResult,
  userGenreBlob: string,
): number {
  // popularity_score: artist at 20 → 1.0, at 55 → 0.0
  const popScore = Math.max(0, (55 - artist.popularity) / 35)

  // genre_distance: fraction of the artist's genres absent from user's profile
  const artistGenres = (artist.genres ?? []).map(g => g.toLowerCase())
  if (artistGenres.length === 0) {
    return Math.round(popScore * 60)
  }
  const novel = artistGenres.filter(g => !userGenreBlob.includes(g)).length
  const genreDistance = novel / artistGenres.length

  return Math.round(popScore * 60 + genreDistance * 40)
}

/**
 * Anti-algorithm score for depth mode (0–100).
 * Rewards: very low popularity (5–20 range) within the user's own genres.
 * These are artists algorithmically invisible even inside familiar territory.
 */
function scoreArtistDepth(
  artist: SpotifyArtistResult,
  userGenreBlob: string,
): number {
  // pop 5 → 1.0, pop 20 → 0.0
  const popScore = Math.max(0, (20 - artist.popularity) / 15)

  // subgenre novelty: fraction of artist's genre tags not in user's blob
  // (rewards artists who bring adjacent subgenres even within the same family)
  const artistGenres = (artist.genres ?? []).map(g => g.toLowerCase())
  if (artistGenres.length === 0) return Math.round(popScore * 100)
  const novel = artistGenres.filter(g => !userGenreBlob.includes(g)).length
  const subgenreNovelty = novel / artistGenres.length

  return Math.round(popScore * 70 + subgenreNovelty * 30)
}

// ── Main pipeline ─────────────────────────────────────────────────────────────

export async function generateEscapeRecommendations(
  profile: SpotifyProfile,
  bubbleScore: BubbleScoreResult,
  accessToken: string,
): Promise<EscapeRecommendation[]> {
  const userGenres = bubbleScore.genreDistribution.slice(0, 8).map(g => g.genre.toLowerCase())
  const userGenreBlob = userGenres.join(" ")

  // All artist IDs the user already knows — exclude from recommendations
  const knownArtistIds = new Set([
    ...profile.timeRanges.short_term.topArtists.map(a => a.id),
    ...profile.timeRanges.medium_term.topArtists.map(a => a.id),
    ...profile.timeRanges.long_term.topArtists.map(a => a.id),
  ])

  const gapGenres = detectGapGenres(userGenres, 5)

  // ── Phase 1: search gap genres (or depth-mode genres) in parallel ─────────
  type Candidate = { genre: string; artist: SpotifyArtistResult; score: number; mode: "gap" | "depth" }

  const candidates: Candidate[] = []
  let resolvedMode: "gap" | "depth" = "gap"

  if (gapGenres.length > 0) {
    const genreResults = await Promise.all(
      gapGenres.map(async (genre) => ({
        genre,
        artists: await searchArtistsByGenre(genre, accessToken),
      })),
    )

    for (const { genre, artists } of genreResults) {
      const eligible = artists.filter(
        (a) =>
          a.popularity >= 20 &&
          a.popularity <= 55 &&
          !knownArtistIds.has(a.id) &&
          (a.followers?.total ?? 0) >= 500,
      )
      const top2 = eligible
        .map((a) => ({ genre, artist: a, score: scoreArtist(a, userGenreBlob), mode: "gap" as const }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 2)
      candidates.push(...top2)
    }
  }

  // ── Depth-mode fallback: broad listeners get obscure artists in own genres ─
  // Triggers when: no gap genres exist, OR gap search yielded nothing.
  if (candidates.length === 0) {
    resolvedMode = "depth"

    // Search the user's top genres for very-low-popularity artists (5–20)
    const depthGenres = bubbleScore.genreDistribution.slice(0, 5).map(g => g.genre.toLowerCase())
    const depthResults = await Promise.all(
      depthGenres.map(async (genre) => ({
        genre,
        artists: await searchArtistsByGenre(genre, accessToken),
      })),
    )

    for (const { genre, artists } of depthResults) {
      const eligible = artists.filter(
        (a) =>
          a.popularity >= 5 &&
          a.popularity <= 20 &&
          !knownArtistIds.has(a.id) &&
          (a.followers?.total ?? 0) >= 100,
      )
      const top2 = eligible
        .map((a) => ({ genre, artist: a, score: scoreArtistDepth(a, userGenreBlob), mode: "depth" as const }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 2)
      candidates.push(...top2)
    }
  }

  if (candidates.length === 0) {
    return []
  }

  // ── Phase 2: fetch top tracks in parallel ─────────────────────────────────
  const results = await Promise.all(
    candidates.map(async ({ genre, artist, score, mode }): Promise<EscapeRecommendation | null> => {
      const track = await fetchArtistTopTrack(artist.id, profile.market, accessToken)
      if (!track) return null

      return {
        gapGenre: genre,
        mode,
        artist: {
          id: artist.id,
          name: artist.name,
          genres: artist.genres ?? [],
          popularity: artist.popularity,
          followers: artist.followers?.total ?? 0,
          imageUrl: artist.images?.[0]?.url ?? null,
          spotifyUrl: artist.external_urls?.spotify ?? `https://open.spotify.com/artist/${artist.id}`,
        },
        track: {
          id: track.id,
          uri: track.uri,
          name: track.name,
          albumName: track.album.name,
          albumImageUrl: track.album.images?.[0]?.url ?? null,
          durationMs: track.duration_ms,
          previewUrl: track.preview_url,
        },
        antiAlgorithmScore: score,
      }
    }),
  )

  void resolvedMode // used for type narrowing above; mode is on each rec
  return results.filter((r): r is EscapeRecommendation => r !== null)
}
