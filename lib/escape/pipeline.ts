import { SPOTIFY_API_BASE_URL } from "@/lib/spotify/constants"
import type { BubbleScoreResult } from "@/lib/analysis/bubble-score"
import type { SpotifyProfile } from "@/lib/types/spotify"
import { detectGapGenres } from "@/lib/escape/genres"

// ── Public types ──────────────────────────────────────────────────────────────

export type EscapeRecommendation = {
  gapGenre: string
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
 * Anti-algorithm score (0–100).
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

  if (gapGenres.length === 0) {
    return []
  }

  // ── Phase 1: search all gap genres in parallel ────────────────────────────
  const genreResults = await Promise.all(
    gapGenres.map(async (genre) => ({
      genre,
      artists: await searchArtistsByGenre(genre, accessToken),
    })),
  )

  // ── Filter and score ──────────────────────────────────────────────────────
  type Candidate = { genre: string; artist: SpotifyArtistResult; score: number }
  const candidates: Candidate[] = []

  for (const { genre, artists } of genreResults) {
    const eligible = artists.filter(
      (a) =>
        a.popularity >= 20 &&
        a.popularity <= 55 &&
        !knownArtistIds.has(a.id) &&
        (a.followers?.total ?? 0) >= 500,
    )

    const top2 = eligible
      .map((a) => ({ genre, artist: a, score: scoreArtist(a, userGenreBlob) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)

    candidates.push(...top2)
  }

  if (candidates.length === 0) {
    return []
  }

  // ── Phase 2: fetch top tracks in parallel ─────────────────────────────────
  const results = await Promise.all(
    candidates.map(async ({ genre, artist, score }): Promise<EscapeRecommendation | null> => {
      const track = await fetchArtistTopTrack(artist.id, profile.market, accessToken)
      if (!track) return null

      return {
        gapGenre: genre,
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

  return results.filter((r): r is EscapeRecommendation => r !== null)
}
