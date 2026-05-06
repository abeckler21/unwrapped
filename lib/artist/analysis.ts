import { SPOTIFY_API_BASE_URL } from "@/lib/spotify/constants"

// ── Types ────────────────────────────────────────────────────────────────────

export type AlbumAnalysis = {
  id: string
  name: string
  albumType: "album" | "single" | "compilation"
  releaseYear: number
  coverImageUrl: string | null
  trackCount: number
  avgDurationMs: number
  collabRate: number   // 0–1: fraction of tracks with ≥2 artists
  popularity: number
  aoi: number          // Algorithm Optimization Index, 0–100
}

export type ArtistAnalysis = {
  artistId: string
  name: string
  imageUrl: string | null
  genres: string[]
  followers: number
  popularity: number
  albums: AlbumAnalysis[]
  popularityTrajectory: { year: number; popularity: number }[]
  genreDrift: string[]  // most recent genres vs earliest genres (narrative)
}

// ── Spotify fetch helper ─────────────────────────────────────────────────────

async function spotifyGet<T>(path: string, accessToken: string): Promise<T> {
  const res = await fetch(`${SPOTIFY_API_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  })
  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`Spotify ${path} failed (${res.status}): ${detail}`)
  }
  return (await res.json()) as T
}

type SpotifyArtist = {
  id: string
  name: string
  images: { url: string }[]
  genres: string[]
  followers: { total: number }
  popularity: number
}

type SpotifyAlbumSummary = {
  id: string
  name: string
  album_type: string
  release_date: string
  images: { url: string }[]
  total_tracks: number
}

type SpotifyTracksPage = {
  items: Array<{
    id: string
    duration_ms: number
    artists: { id: string }[]
  }>
}

// ── AOI formula ──────────────────────────────────────────────────────────────

function computeAoi(avgDurationMs: number, collabRate: number): number {
  // shortScore: 3 min → 1.0, 5 min → 0.0
  const shortScore = Math.max(0, Math.min(1, 1 - (avgDurationMs - 180_000) / 120_000))
  const aoi = Math.round((shortScore * 0.6 + collabRate * 0.4) * 100)
  return aoi
}

// ── Main analysis function ───────────────────────────────────────────────────

export async function analyzeArtist(
  artistId: string,
  accessToken: string,
): Promise<ArtistAnalysis> {
  // 1. Fetch artist profile
  const artist = await spotifyGet<SpotifyArtist>(`/artists/${artistId}`, accessToken)

  // 2. Fetch all albums/singles (paginated, up to 100)
  const allAlbumItems: SpotifyAlbumSummary[] = []
  // Note: include_groups comma must NOT be URL-encoded; pass raw query string
  let nextUrl: string | null =
    `${SPOTIFY_API_BASE_URL}/artists/${artistId}/albums?include_groups=album,single`
  while (nextUrl && allAlbumItems.length < 100) {
    const res = await fetch(nextUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    })
    if (!res.ok) {
      const detail = await res.text()
      throw new Error(`Spotify albums fetch failed (${res.status}): ${detail}`)
    }
    const page = (await res.json()) as { items: SpotifyAlbumSummary[]; next: string | null }
    allAlbumItems.push(...page.items)
    nextUrl = page.next ?? null
  }

  // Deduplicate by name (keep earliest), then limit to 40
  const seen = new Set<string>()
  const dedupedAlbums: SpotifyAlbumSummary[] = []
  for (const a of allAlbumItems) {
    const key = a.name.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      dedupedAlbums.push(a)
    }
  }
  const albumsToAnalyze = dedupedAlbums.slice(0, 40)

  // 3. Fetch tracks for each album individually (batch /albums endpoint returns 403 in dev mode)
  const albums: AlbumAnalysis[] = []
  for (const albumSummary of albumsToAnalyze) {
    try {
      const tracksPage = await spotifyGet<SpotifyTracksPage>(
        `/albums/${albumSummary.id}/tracks?limit=50`,
        accessToken,
      )
      const tracks = tracksPage.items ?? []
      if (tracks.length === 0) continue

      const avgDurationMs = tracks.reduce((s, t) => s + (t.duration_ms ?? 0), 0) / tracks.length
      const collabTracks = tracks.filter((t) => (t.artists?.length ?? 1) >= 2).length
      const collabRate = collabTracks / tracks.length
      const aoi = computeAoi(avgDurationMs, collabRate)
      const releaseYear = parseInt(albumSummary.release_date.slice(0, 4), 10) || 2000
      const albumType = (albumSummary.album_type === "single" ? "single" :
        albumSummary.album_type === "compilation" ? "compilation" : "album") as AlbumAnalysis["albumType"]

      albums.push({
        id: albumSummary.id,
        name: albumSummary.name,
        albumType,
        releaseYear,
        coverImageUrl: albumSummary.images[0]?.url ?? null,
        trackCount: tracks.length,
        avgDurationMs: Math.round(avgDurationMs),
        collabRate: Math.round(collabRate * 100) / 100,
        popularity: 0,
        aoi,
      })
    } catch {
      // Skip albums we can't fetch tracks for
    }
  }
  albums.sort((a, b) => a.releaseYear - b.releaseYear)

  // 4. Popularity trajectory — not available without batch album fetch, omit
  const popularityTrajectory: { year: number; popularity: number }[] = []

  // 6. Genre drift (first vs last 3 years of releases)
  const years = albums.map((a) => a.releaseYear)
  const minYear = Math.min(...years)
  const maxYear = Math.max(...years)
  const genreDrift: string[] = []
  if (maxYear - minYear >= 4) {
    const earlyGenres = artist.genres.slice(0, 2)
    const lateGenres = artist.genres.slice(-2)
    if (earlyGenres.join() !== lateGenres.join()) {
      genreDrift.push(...earlyGenres.map((g) => `early: ${g}`))
      genreDrift.push(...lateGenres.map((g) => `recent: ${g}`))
    }
  }

  return {
    artistId: artist.id,
    name: artist.name,
    imageUrl: artist.images[0]?.url ?? null,
    genres: artist.genres,
    followers: artist.followers.total,
    popularity: artist.popularity,
    albums,
    popularityTrajectory,
    genreDrift,
  }
}
