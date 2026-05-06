import { cookies } from "next/headers";

import { refreshSpotifyAccessToken } from "@/lib/spotify/auth";
import { SESSION_COOKIE_NAMES } from "@/lib/spotify/constants";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function getCookieSecurity() {
  return process.env.VERCEL_ENV !== undefined || process.env.NODE_ENV === "production";
}

export async function setOAuthCookies(state: string, verifier: string) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAMES.oauthState, state, {
    httpOnly: true,
    secure: getCookieSecurity(),
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });

  cookieStore.set(SESSION_COOKIE_NAMES.pkceVerifier, verifier, {
    httpOnly: true,
    secure: getCookieSecurity(),
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });
}

export async function getOAuthCookies() {
  const cookieStore = await cookies();

  return {
    state: cookieStore.get(SESSION_COOKIE_NAMES.oauthState)?.value,
    verifier: cookieStore.get(SESSION_COOKIE_NAMES.pkceVerifier)?.value,
  };
}

export async function clearOAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAMES.oauthState);
  cookieStore.delete(SESSION_COOKIE_NAMES.pkceVerifier);
}

export async function setSpotifySessionCookies(params: {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
  spotifyUserId: string;
}) {
  const cookieStore = await cookies();
  const expiresAt = Date.now() + params.expiresInSeconds * 1000;

  cookieStore.set(SESSION_COOKIE_NAMES.accessToken, params.accessToken, {
    httpOnly: true,
    secure: getCookieSecurity(),
    sameSite: "lax",
    path: "/",
    maxAge: params.expiresInSeconds,
  });

  cookieStore.set(SESSION_COOKIE_NAMES.refreshToken, params.refreshToken, {
    httpOnly: true,
    secure: getCookieSecurity(),
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  });

  cookieStore.set(SESSION_COOKIE_NAMES.tokenExpiresAt, String(expiresAt), {
    httpOnly: true,
    secure: getCookieSecurity(),
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  });

  cookieStore.set(SESSION_COOKIE_NAMES.spotifyUserId, params.spotifyUserId, {
    httpOnly: true,
    secure: getCookieSecurity(),
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  });
}

export async function getSpotifySession() {
  const cookieStore = await cookies();

  return {
    accessToken: cookieStore.get(SESSION_COOKIE_NAMES.accessToken)?.value,
    refreshToken: cookieStore.get(SESSION_COOKIE_NAMES.refreshToken)?.value,
    tokenExpiresAt: cookieStore.get(SESSION_COOKIE_NAMES.tokenExpiresAt)?.value,
    spotifyUserId: cookieStore.get(SESSION_COOKIE_NAMES.spotifyUserId)?.value,
  };
}

/**
 * Returns a valid access token, refreshing automatically if the stored token
 * has expired. Returns null if no refresh token is available or refresh fails.
 */
export async function getValidAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(SESSION_COOKIE_NAMES.accessToken)?.value;

  if (accessToken) return accessToken;

  // Token cookie expired — try to refresh
  const refreshToken = cookieStore.get(SESSION_COOKIE_NAMES.refreshToken)?.value;
  const spotifyUserId = cookieStore.get(SESSION_COOKIE_NAMES.spotifyUserId)?.value;
  if (!refreshToken || !spotifyUserId) return null;

  try {
    const tokens = await refreshSpotifyAccessToken(refreshToken);
    await setSpotifySessionCookies({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? refreshToken,
      expiresInSeconds: tokens.expires_in,
      spotifyUserId,
    });
    return tokens.access_token;
  } catch {
    return null;
  }
}

export async function clearSpotifySessionCookies() {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE_NAMES.accessToken);
  cookieStore.delete(SESSION_COOKIE_NAMES.refreshToken);
  cookieStore.delete(SESSION_COOKIE_NAMES.tokenExpiresAt);
  cookieStore.delete(SESSION_COOKIE_NAMES.spotifyUserId);
}
