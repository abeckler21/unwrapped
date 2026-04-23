import crypto from "node:crypto";

import { env } from "@/lib/env";
import {
  SESSION_COOKIE_NAMES,
  SPOTIFY_ACCOUNTS_BASE_URL,
  SPOTIFY_SCOPES,
} from "@/lib/spotify/constants";

export type SpotifyTokenResponse = {
  access_token: string;
  token_type: "Bearer";
  scope: string;
  expires_in: number;
  refresh_token?: string;
};

function toBase64Url(buffer: Buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function generateOAuthState() {
  return toBase64Url(crypto.randomBytes(24));
}

export function generatePkceVerifier() {
  return toBase64Url(crypto.randomBytes(48));
}

export function createCodeChallenge(verifier: string) {
  return toBase64Url(crypto.createHash("sha256").update(verifier).digest());
}

export function createSpotifyAuthorizationUrl() {
  if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_REDIRECT_URI) {
    throw new Error("Spotify environment variables are missing.");
  }

  const state = generateOAuthState();
  const verifier = generatePkceVerifier();
  const challenge = createCodeChallenge(verifier);

  const url = new URL(`${SPOTIFY_ACCOUNTS_BASE_URL}/authorize`);
  url.searchParams.set("client_id", env.SPOTIFY_CLIENT_ID);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", env.SPOTIFY_REDIRECT_URI);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("state", state);
  url.searchParams.set("scope", SPOTIFY_SCOPES.join(" "));

  return {
    url: url.toString(),
    state,
    verifier,
  };
}

export async function exchangeAuthorizationCode(code: string, verifier: string) {
  if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET || !env.SPOTIFY_REDIRECT_URI) {
    throw new Error("Spotify environment variables are missing.");
  }

  const response = await fetch(`${SPOTIFY_ACCOUNTS_BASE_URL}/api/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`,
      ).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: env.SPOTIFY_REDIRECT_URI,
      code_verifier: verifier,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Spotify token exchange failed with status ${response.status}.`);
  }

  return (await response.json()) as SpotifyTokenResponse;
}

export async function refreshSpotifyAccessToken(refreshToken: string) {
  if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET) {
    throw new Error("Spotify environment variables are missing.");
  }

  const response = await fetch(`${SPOTIFY_ACCOUNTS_BASE_URL}/api/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`,
      ).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Spotify token refresh failed with status ${response.status}.`);
  }

  return (await response.json()) as SpotifyTokenResponse;
}

export function getOAuthCookieNames() {
  return {
    state: SESSION_COOKIE_NAMES.oauthState,
    verifier: SESSION_COOKIE_NAMES.pkceVerifier,
  };
}
