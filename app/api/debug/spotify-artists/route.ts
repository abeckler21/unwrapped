import { NextResponse } from "next/server";

import { getSpotifySession } from "@/lib/spotify/session";

const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";

async function spotifyFetch(path: string, accessToken: string) {
  const response = await fetch(`${SPOTIFY_API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const text = await response.text();

  return {
    ok: response.ok,
    status: response.status,
    body: text,
  };
}

export async function GET() {
  const session = await getSpotifySession();

  if (!session.accessToken) {
    return NextResponse.json(
      {
        error: "Missing Spotify access token in session.",
      },
      { status: 401 },
    );
  }

  const topArtistsResult = await spotifyFetch(
    "/me/top/artists?time_range=medium_term&limit=5",
    session.accessToken,
  );

  let enrichResult:
    | {
        ok: boolean;
        status: number;
        body: string;
      }
    | undefined;
  let singleArtistResult:
    | {
        ok: boolean;
        status: number;
        body: string;
      }
    | undefined;

  if (topArtistsResult.ok) {
    const parsed = JSON.parse(topArtistsResult.body) as {
      items?: Array<{ id?: string }>;
    };
    const ids = parsed.items?.map((artist) => artist.id).filter(Boolean) ?? [];

    if (ids.length) {
      enrichResult = await spotifyFetch(`/artists?ids=${ids.join(",")}`, session.accessToken);
      singleArtistResult = await spotifyFetch(`/artists/${ids[0]}`, session.accessToken);
    }
  }

  return NextResponse.json({
    topArtists: topArtistsResult,
    enrichedArtists: enrichResult ?? null,
    singleArtist: singleArtistResult ?? null,
  });
}
