import { NextRequest, NextResponse } from "next/server"
import { SPOTIFY_API_BASE_URL } from "@/lib/spotify/constants"
import { fetchLastFmArtistTags } from "@/lib/lastfm/client"
import { getValidAccessToken } from "@/lib/spotify/session"

type SpotifySearchResult = {
  artists?: {
    items?: Array<{
      id: string
      name: string
      genres?: string[]
      popularity?: number
      followers?: { total: number }
      images?: { url: string }[]
    }>
  }
}

export async function GET(request: NextRequest) {
  try {
    const accessToken = await getValidAccessToken()

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const q = request.nextUrl.searchParams.get("q")?.trim()
    if (!q || q.length < 2) {
      return NextResponse.json({ error: "Query too short" }, { status: 400 })
    }

    const res = await fetch(
      `${SPOTIFY_API_BASE_URL}/search?type=artist&q=${encodeURIComponent(q)}&limit=5`,
      { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" },
    )

    if (!res.ok) {
      const spotifyError = await res.json().catch(() => ({})) as { error?: { message?: string } }
      const detail = spotifyError?.error?.message ?? `Spotify returned ${res.status}`
      return NextResponse.json({ error: detail }, { status: 502 })
    }

    const data = (await res.json()) as SpotifySearchResult
    const items = data.artists?.items ?? []

    // Enrich genres from LastFM (Spotify search often returns empty genres)
    const results = await Promise.all(
      items.map(async (a) => {
        let genres: string[] = a.genres?.slice(0, 3) ?? []
        if (genres.length === 0) {
          const tags = await fetchLastFmArtistTags(a.name).catch(() => null)
          genres = tags?.normalizedTags.slice(0, 3) ?? []
        }
        return {
          id: a.id,
          name: a.name,
          genres,
          imageUrl: a.images?.[0]?.url ?? null,
        }
      })
    )

    return NextResponse.json({ results })
  } catch (err) {
    console.error("[artist/search] unhandled error:", err)
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
