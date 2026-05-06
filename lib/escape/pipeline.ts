import { SPOTIFY_API_BASE_URL } from "@/lib/spotify/constants"
import type { BubbleScoreResult } from "@/lib/analysis/bubble-score"
import type { SpotifyProfile } from "@/lib/types/spotify"
import { detectGapGenres } from "@/lib/escape/genres"

// ── Public types ──────────────────────────────────────────────────────────────

export type EscapeRecommendation = {
  recommendationVersion: 2
  gapGenre: string
  /**
   * "gap"   — artist is in a genre entirely absent from the user's profile
   * "depth" — artist is in a genre the user already listens to, but buried
   *           deeper in Spotify search than the obvious first-page results
   */
  mode: "gap" | "depth"
  artist: {
    id: string
    name: string
    genres: string[]
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
  images?: Array<{ url: string }>
  external_urls?: { spotify: string }
}

type SpotifyTrackResult = {
  id: string
  uri: string
  name: string
  duration_ms: number
  preview_url?: string | null
  album: {
    name: string
    images?: Array<{ url: string }>
  }
  artists?: Array<{ name: string }>
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
  const offsets = [0, 10, 20]
  const pages = await Promise.all(
    offsets.map(async (offset) => {
      const params = new URLSearchParams({
        q: `genre:"${genre}"`,
        type: "artist",
        limit: "10",
        offset: String(offset),
      })
      const data = await spotifyGet<{ artists: { items: SpotifyArtistResult[] } }>(
        `/search?${params}`,
        accessToken,
      )
      return data?.artists?.items ?? []
    }),
  )

  const seen = new Set<string>()
  return pages
    .flat()
    .filter((artist) => {
      if (!artist.id || seen.has(artist.id)) return false
      seen.add(artist.id)
      return true
    })
}

async function fetchArtistTopTrack(
  artist: SpotifyArtistResult,
  market: string,
  accessToken: string,
): Promise<SpotifyTrackResult | null> {
  const safeMarket = /^[A-Z]{2}$/.test(market) ? market : "US"
  const data = await spotifyGet<{ tracks: SpotifyTrackResult[] }>(
    `/artists/${artist.id}/top-tracks?market=${safeMarket}`,
    accessToken,
  )

  if (data?.tracks?.[0]) {
    return data.tracks[0]
  }

  const params = new URLSearchParams({
    q: `artist:${artist.name}`,
    type: "track",
    limit: "5",
  })
  const search = await spotifyGet<{ tracks: { items: SpotifyTrackResult[] } }>(
    `/search?${params}`,
    accessToken,
  )
  const tracks = search?.tracks?.items ?? []

  return (
    tracks.find((track) =>
      track.artists?.some((trackArtist) => sameName(trackArtist.name, artist.name)),
    ) ??
    tracks[0] ??
    null
  )
}

// ── Scoring ───────────────────────────────────────────────────────────────────

/**
 * Anti-algorithm score for gap mode (0–100).
 * Rewards: deeper search rank and genres far from the user's profile.
 */
function scoreArtist(
  artist: SpotifyArtistResult,
  userGenreBlob: string,
  searchRank: number,
): number {
  const rankScore = Math.min(1, Math.max(0, searchRank / 50))

  // genre_distance: fraction of the artist's genres absent from user's profile
  const artistGenres = (artist.genres ?? []).map(g => g.toLowerCase())
  if (artistGenres.length === 0) {
    return Math.round(45 + rankScore * 55)
  }
  const novel = artistGenres.filter(g => !userGenreBlob.includes(g)).length
  const genreDistance = novel / artistGenres.length

  return Math.round(rankScore * 55 + genreDistance * 45)
}

/**
 * Anti-algorithm score for depth mode (0–100).
 * Rewards: deeper search rank within the user's own genres.
 * These are artists algorithmically invisible even inside familiar territory.
 */
function scoreArtistDepth(
  artist: SpotifyArtistResult,
  userGenreBlob: string,
  searchRank: number,
): number {
  const rankScore = Math.min(1, Math.max(0, searchRank / 50))

  // subgenre novelty: fraction of artist's genre tags not in user's blob
  // (rewards artists who bring adjacent subgenres even within the same family)
  const artistGenres = (artist.genres ?? []).map(g => g.toLowerCase())
  if (artistGenres.length === 0) return Math.round(35 + rankScore * 65)
  const novel = artistGenres.filter(g => !userGenreBlob.includes(g)).length
  const subgenreNovelty = novel / artistGenres.length

  return Math.round(rankScore * 70 + subgenreNovelty * 30)
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

  if (gapGenres.length > 0) {
    const genreResults = await Promise.all(
      gapGenres.map(async (genre) => ({
        genre,
        artists: await searchArtistsByGenre(genre, accessToken),
      })),
    )

    for (const { genre, artists } of genreResults) {
      const eligible = artists.filter((a) => !knownArtistIds.has(a.id))
      const top2 = eligible
        .map((a, index) => ({
          genre,
          artist: withFallbackGenre(a, genre),
          score: scoreArtist(a, userGenreBlob, index),
          mode: "gap" as const,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 2)
      candidates.push(...top2)
    }
  }

  // ── Depth-mode fallback: broad listeners get obscure artists in own genres ─
  // Triggers when: no gap genres exist, OR gap search yielded nothing.
  if (candidates.length === 0) {
    // Search the user's top genres for less obvious artists beyond the first page.
    const depthGenres = bubbleScore.genreDistribution.slice(0, 5).map(g => g.genre.toLowerCase())
    const depthResults = await Promise.all(
      depthGenres.map(async (genre) => ({
        genre,
        artists: await searchArtistsByGenre(genre, accessToken),
      })),
    )

    for (const { genre, artists } of depthResults) {
      const eligible = artists.filter((a) => !knownArtistIds.has(a.id))
      const top2 = eligible
        .map((a, index) => ({
          genre,
          artist: withFallbackGenre(a, genre),
          score: scoreArtistDepth(a, userGenreBlob, index),
          mode: "depth" as const,
        }))
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
      const track = await fetchArtistTopTrack(artist, profile.market, accessToken)
      if (!track) return null

      return {
        recommendationVersion: 2,
        gapGenre: genre,
        mode,
        artist: {
          id: artist.id,
          name: artist.name,
          genres: artist.genres ?? [],
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
          previewUrl: track.preview_url ?? null,
        },
        antiAlgorithmScore: score,
      }
    }),
  )

  return results.filter((r): r is EscapeRecommendation => r !== null)
}

function withFallbackGenre(artist: SpotifyArtistResult, genre: string): SpotifyArtistResult {
  return {
    ...artist,
    genres: artist.genres?.length ? artist.genres : [genre],
  }
}

function sameName(a: string, b: string) {
  return normalizeForMatch(a) === normalizeForMatch(b)
}

function normalizeForMatch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}
