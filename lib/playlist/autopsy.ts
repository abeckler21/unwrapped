import { SPOTIFY_API_BASE_URL } from "@/lib/spotify/constants"
import { getLastFmArtistTags } from "@/lib/lastfm/cache"

// ── Types ────────────────────────────────────────────────────────────────────

export type PlaylistTrack = {
  id: string
  name: string
  artistNames: string[]
  albumName: string
  albumImageUrl: string | null
  releaseYear: number
  durationMs: number
  popularity: number
  isExplicit: boolean
}

export type PlaylistAutopsy = {
  playlistId: string
  name: string
  ownerName: string
  isSpotifyOwned: boolean
  coverImageUrl: string | null
  totalTracks: number
  tracks: PlaylistTrack[]
  // Scores
  algorithmScore: number
  scoreBreakdown: {
    nameSignal: number       // 0-30
    ownerSignal: number      // 0-20
    popularitySkew: number   // 0-25
    recencySignal: number    // 0-15
    homogeneitySignal: number // 0-10
  }
  classification: "Algorithmic" | "Human-curated" | "Mixed"
  // Analysis
  genreDistribution: { genre: string; count: number }[]
  eraDistribution: { era: string; count: number }[]
  meanPopularity: number
  meanDurationMs: number
}

// ── Spotify fetch helpers ────────────────────────────────────────────────────

class SpotifyRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly path: string,
    public readonly detail: string,
  ) {
    super(message)
    this.name = "SpotifyRequestError"
  }
}

async function spotifyGet<T>(path: string, accessToken: string): Promise<T> {
  const res = await fetch(`${SPOTIFY_API_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  })
  if (!res.ok) {
    const detail = await res.text()
    throw new SpotifyRequestError(
      `Spotify ${path} failed (${res.status}): ${detail}`,
      res.status,
      path,
      detail,
    )
  }
  return (await res.json()) as T
}

type SpotifyPlaylist = {
  id: string
  name: string
  owner: { id: string; display_name: string }
  images: { url: string }[]
  tracks?: { total: number }
}

type SpotifyTracksPage = {
  items: Array<{
    track: {
      id: string
      name: string
      artists: { id: string; name: string }[]
      album: {
        name: string
        images: { url: string }[]
        release_date: string
      }
      duration_ms: number
      popularity: number
      explicit: boolean
    } | null
  }>
  next: string | null
}

type SpotifyArtist = {
  id: string
  genres: string[]
}

type SpotifySearchTracksResponse = {
  tracks: {
    items: NonNullable<SpotifyTracksPage["items"][number]["track"]>[]
  }
}

type EmbedTrack = {
  uri: string
  title: string
  subtitle: string
  isExplicit?: boolean
  duration?: number
  entityType?: string
}

type SpotifyEmbedPayload = {
  props?: {
    pageProps?: {
      state?: {
        data?: {
          entity?: {
            trackList?: EmbedTrack[]
            coverArt?: {
              sources?: { url: string }[]
            }
          }
        }
      }
    }
  }
}

type TrackSource = NonNullable<SpotifyTracksPage["items"][number]["track"]>

// ── Main analysis function ───────────────────────────────────────────────────

export async function analyzePlaylist(
  playlistId: string,
  accessToken: string,
): Promise<PlaylistAutopsy> {
  // 1. Fetch playlist metadata
  const playlist = await spotifyGet<SpotifyPlaylist>(
    `/playlists/${playlistId}?fields=id,name,owner,images,tracks.total`,
    accessToken,
  )

  // 2. Fetch all tracks (paginated, up to 200). Spotify sometimes returns 403
  // for public playlist items while still allowing the public embed to render.
  const validTracks = await fetchPlaylistTracks(playlistId, accessToken)

  // 3. Batch-fetch artist genres (up to 50 per request)
  const artistIds = [
    ...new Set(
      validTracks
        .flatMap((t) => t.artists.map((a) => a.id))
        .filter((id) => /^[A-Za-z0-9]{22}$/.test(id)),
    ),
  ]
  const artistGenreMap = new Map<string, string[]>()
  const artistNamesById = new Map(
    validTracks.flatMap((track) => track.artists.map((artist) => [artist.id, artist.name] as const)),
  )

  try {
    for (let i = 0; i < artistIds.length; i += 50) {
      const batch = artistIds.slice(i, i + 50)
      const { artists } = await spotifyGet<{ artists: SpotifyArtist[] }>(
        `/artists?ids=${batch.join(",")}`,
        accessToken,
      )
      for (const artist of artists) {
        artistGenreMap.set(artist.id, artist.genres)
      }
    }
  } catch {
    await mapWithConcurrency(
      [...artistNamesById.entries()],
      5,
      async ([artistId, artistName]) => {
        try {
          const tags = await getLastFmArtistTags(artistName)
          if (tags?.normalizedTags.length) {
            artistGenreMap.set(artistId, tags.normalizedTags)
          }
        } catch {
          // Missing artist genres should lower confidence, not break the autopsy.
        }
      },
    )
  }

  // 4. Build track list
  const currentYear = new Date().getFullYear()
  const tracks: PlaylistTrack[] = validTracks.map((t) => {
    const releaseYear = parseInt(t.album.release_date.slice(0, 4), 10) || currentYear
    return {
      id: t.id,
      name: t.name,
      artistNames: t.artists.map((a) => a.name),
      albumName: t.album.name,
      albumImageUrl: t.album.images[0]?.url ?? null,
      releaseYear,
      durationMs: t.duration_ms,
      popularity: t.popularity,
      isExplicit: t.explicit,
    }
  })

  // 5. Compute scores
  const isSpotifyOwned = playlist.owner.id === "spotify"

  const ALGO_NAME_RE =
    /discover weekly|daily mix|release radar|daylist|on repeat|time capsule/i
  const nameSignal = ALGO_NAME_RE.test(playlist.name) ? 30 : 0
  const ownerSignal = isSpotifyOwned ? 20 : 0

  const meanPopularity =
    tracks.length > 0
      ? tracks.reduce((s, t) => s + t.popularity, 0) / tracks.length
      : 50
  const popularitySkew = Math.max(0, Math.min(25, ((meanPopularity - 45) / 55) * 25))

  const recentCount = tracks.filter((t) => currentYear - t.releaseYear <= 2).length
  const recencySignal = tracks.length > 0 ? (recentCount / tracks.length) * 15 : 0

  // Genre HHI for homogeneity
  const allGenres: string[] = []
  for (const t of validTracks) {
    for (const artist of t.artists) {
      const genres = artistGenreMap.get(artist.id) ?? []
      allGenres.push(...genres.slice(0, 2))
    }
  }
  const genreCounts = new Map<string, number>()
  for (const g of allGenres) genreCounts.set(g, (genreCounts.get(g) ?? 0) + 1)
  const total = allGenres.length || 1
  const hhi = [...genreCounts.values()].reduce((s, c) => s + (c / total) ** 2, 0)
  const homogeneitySignal = Math.min(10, hhi * 10)

  const algorithmScore = Math.round(
    nameSignal + ownerSignal + popularitySkew + recencySignal + homogeneitySignal,
  )
  const classification: PlaylistAutopsy["classification"] =
    algorithmScore >= 55 ? "Algorithmic" : algorithmScore <= 20 ? "Human-curated" : "Mixed"

  // 6. Genre distribution (top 10)
  const genreDistribution = [...genreCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([genre, count]) => ({ genre, count }))

  // 7. Era distribution (decades)
  const eraCounts = new Map<string, number>()
  for (const t of tracks) {
    const era = `${Math.floor(t.releaseYear / 10) * 10}s`
    eraCounts.set(era, (eraCounts.get(era) ?? 0) + 1)
  }
  const eraDistribution = [...eraCounts.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([era, count]) => ({ era, count }))

  const meanDurationMs =
    tracks.length > 0 ? tracks.reduce((s, t) => s + t.durationMs, 0) / tracks.length : 0

  return {
    playlistId: playlist.id,
    name: playlist.name,
    ownerName: playlist.owner.display_name,
    isSpotifyOwned,
    coverImageUrl: playlist.images[0]?.url ?? null,
    totalTracks: playlist.tracks?.total ?? tracks.length,
    tracks,
    algorithmScore,
    scoreBreakdown: {
      nameSignal,
      ownerSignal,
      popularitySkew: Math.round(popularitySkew),
      recencySignal: Math.round(recencySignal),
      homogeneitySignal: Math.round(homogeneitySignal),
    },
    classification,
    genreDistribution,
    eraDistribution,
    meanPopularity: Math.round(meanPopularity),
    meanDurationMs: Math.round(meanDurationMs),
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function fetchPlaylistTracks(playlistId: string, accessToken: string) {
  try {
    return await fetchPlaylistTracksFromSpotifyApi(playlistId, accessToken)
  } catch (error) {
    if (!(error instanceof SpotifyRequestError) || error.status !== 403) {
      throw error
    }

    return fetchPlaylistTracksFromEmbed(playlistId, accessToken)
  }
}

async function fetchPlaylistTracksFromSpotifyApi(playlistId: string, accessToken: string) {
  const rawTracks: SpotifyTracksPage["items"] = []
  let nextUrl: string | null =
    `/playlists/${playlistId}/tracks?limit=100&fields=items(track(id,name,artists,album,duration_ms,popularity,explicit)),next`

  while (nextUrl && rawTracks.length < 200) {
    const fetchPath: string = nextUrl.startsWith("http")
      ? nextUrl.replace(SPOTIFY_API_BASE_URL, "")
      : nextUrl
    const page = await spotifyGet<SpotifyTracksPage>(fetchPath, accessToken)
    rawTracks.push(...page.items)
    nextUrl = page.next
  }

  return rawTracks
    .map((item) => item.track)
    .filter((track): track is TrackSource => Boolean(track?.id))
}

async function fetchPlaylistTracksFromEmbed(playlistId: string, accessToken: string) {
  const res = await fetch(`https://open.spotify.com/embed/playlist/${playlistId}`, {
    headers: {
      "User-Agent": "Unwrapped Playlist Autopsy",
    },
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`Spotify public embed failed (${res.status}).`)
  }

  const html = await res.text()
  const jsonText = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
  )?.[1]

  if (!jsonText) {
    throw new Error("Spotify public embed did not include playlist track data.")
  }

  const payload = JSON.parse(jsonText) as SpotifyEmbedPayload
  const embedTracks =
    payload.props?.pageProps?.state?.data?.entity?.trackList
      ?.filter((track) => track.entityType === "track")
      .slice(0, 200) ?? []

  if (!embedTracks.length) {
    throw new Error("Spotify public embed did not include playable tracks.")
  }

  const enriched = await mapWithConcurrency(embedTracks, 5, async (track) => {
    const searched = await searchTrack(track, accessToken)
    if (searched) return searched

    const id = track.uri.replace("spotify:track:", "")
    const artistName = track.subtitle || "Unknown artist"
    return {
      id,
      name: track.title,
      artists: [{ id: `embed:${artistName.toLowerCase()}`, name: artistName }],
      album: {
        name: "Unknown album",
        images: [],
        release_date: String(new Date().getFullYear()),
      },
      duration_ms: track.duration ?? 0,
      popularity: 50,
      explicit: Boolean(track.isExplicit),
    } satisfies TrackSource
  })

  return enriched
}

async function searchTrack(track: EmbedTrack, accessToken: string) {
  const firstArtist = track.subtitle.split(",")[0]?.trim() ?? track.subtitle
  const queries = [
    `track:${track.title} artist:${firstArtist}`,
    `${track.title} ${firstArtist}`,
  ]

  for (const query of queries) {
    try {
      const result = await spotifyGet<SpotifySearchTracksResponse>(
        `/search?type=track&limit=3&q=${encodeURIComponent(query)}`,
        accessToken,
      )
      const best = result.tracks.items.find((candidate) =>
        isLikelySameTrack(candidate, track, firstArtist),
      )

      if (best) {
        return best
      }
    } catch {
      return null
    }
  }

  return null
}

function isLikelySameTrack(candidate: TrackSource, track: EmbedTrack, firstArtist: string) {
  const candidateName = normalizeForMatch(candidate.name)
  const trackName = normalizeForMatch(track.title)
  const candidateArtists = candidate.artists.map((artist) => normalizeForMatch(artist.name))
  const artistName = normalizeForMatch(firstArtist)

  return (
    (candidateName === trackName || candidateName.includes(trackName) || trackName.includes(candidateName)) &&
    candidateArtists.some((name) => name === artistName || name.includes(artistName) || artistName.includes(name))
  )
}

function normalizeForMatch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
) {
  const results: R[] = []

  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency)
    results.push(...(await Promise.all(chunk.map(mapper))))
  }

  return results
}

/** Extract a Spotify playlist ID from a URL or plain ID string. */
export function extractPlaylistId(input: string): string | null {
  const trimmed = input.trim()
  // Already a bare ID (22 alphanumeric chars)
  if (/^[A-Za-z0-9]{22}$/.test(trimmed)) return trimmed
  // URL: https://open.spotify.com/playlist/37i9dQZF1DX...
  const match = trimmed.match(/playlist\/([A-Za-z0-9]+)/)
  return match?.[1] ?? null
}
