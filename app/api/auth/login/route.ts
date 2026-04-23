import { NextResponse } from "next/server";

import { env, hasSpotifyEnv } from "@/lib/env";
import { createSpotifyAuthorizationUrl } from "@/lib/spotify/auth";
import { setOAuthCookies } from "@/lib/spotify/session";

export async function GET() {
  if (!hasSpotifyEnv()) {
    return NextResponse.redirect(new URL("/setup?missing=spotify", env.NEXT_PUBLIC_BASE_URL));
  }

  const { url, state, verifier } = createSpotifyAuthorizationUrl();
  await setOAuthCookies(state, verifier);

  return NextResponse.redirect(url);
}
