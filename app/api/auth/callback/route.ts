import { NextRequest, NextResponse } from "next/server";

import { readCachedSpotifyProfile, writeCachedSpotifyProfile } from "@/lib/cache/spotify-profile-cache";
import { env, hasSpotifyEnv } from "@/lib/env";
import { exchangeAuthorizationCode } from "@/lib/spotify/auth";
import { fetchCurrentSpotifyUser, fetchSpotifyProfile } from "@/lib/spotify/profile";
import {
  clearOAuthCookies,
  clearSpotifySessionCookies,
  getOAuthCookies,
  setSpotifySessionCookies,
} from "@/lib/spotify/session";

export async function GET(request: NextRequest) {
  if (!hasSpotifyEnv()) {
    return NextResponse.redirect(new URL("/setup?missing=spotify", env.NEXT_PUBLIC_BASE_URL));
  }

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    await clearOAuthCookies();
    return NextResponse.redirect(new URL(`/setup?spotify_error=${error}`, env.NEXT_PUBLIC_BASE_URL));
  }

  const oauthCookies = await getOAuthCookies();

  if (!code || !state || !oauthCookies.state || !oauthCookies.verifier || oauthCookies.state !== state) {
    await clearOAuthCookies();
    await clearSpotifySessionCookies();
    return NextResponse.redirect(new URL("/setup?spotify_error=invalid_state", env.NEXT_PUBLIC_BASE_URL));
  }

  try {
    const tokenResponse = await exchangeAuthorizationCode(code, oauthCookies.verifier);
    const user = await fetchCurrentSpotifyUser(tokenResponse.access_token);

    await setSpotifySessionCookies({
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token ?? "",
      expiresInSeconds: tokenResponse.expires_in,
      spotifyUserId: user.id,
    });

    const cachedProfile = await readCachedSpotifyProfile(user.id);

    if (!cachedProfile) {
      const profile = await fetchSpotifyProfile(tokenResponse.access_token);
      await writeCachedSpotifyProfile(user.id, profile);
    }

    await clearOAuthCookies();

    return NextResponse.redirect(new URL("/dashboard", env.NEXT_PUBLIC_BASE_URL));
  } catch {
    await clearOAuthCookies();
    await clearSpotifySessionCookies();
    return NextResponse.redirect(new URL("/setup?spotify_error=callback_failed", env.NEXT_PUBLIC_BASE_URL));
  }
}
