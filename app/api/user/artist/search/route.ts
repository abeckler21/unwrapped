import { NextRequest, NextResponse } from "next/server"
import { SPOTIFY_API_BASE_URL } from "@/lib/spotify/constants"
import { getSpotifySession } from "@/lib/spotify/session"

type SpotifySearchResult = {
  artists: {
    items: Array<{
      id: string
      name: string
      genres: string[]
      popularity: number
      followers: { total: number }
      images: { url: string }[]
    }>
  }
}

export async function GET(request: NextRequest) {
  const session = await getSpotifySession()

  if (!session.spotifyUserId || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const q = request.nextUrl.searchParams.get("q")?.trim()
  if (!q || q.length < 2) {
    return NextResponse.json({ error: "Query too short" }, { status: 400 })
  }

  const res = await fetch(
    `${SPOTIFY_API_BASE_URL}/search?type=artist&q=${encodeURIComponent(q)}&limit=5`,
    { headers: { Authorization: `Bearer ${session.accessToken}` }, cache: "no-store" },
  )

  if (!res.ok) {
    return NextResponse.json({ error: "Spotify search failed" }, { status: 502 })
  }

  const data = (await res.json()) as SpotifySearchResult
  const results = (data.artists?.items ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    genres: a.genres.slice(0, 3),
    popularity: a.popularity,
    followers: a.followers.total,
    imageUrl: a.images[0]?.url ?? null,
  }))

  return NextResponse.json({ results })
}
