import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { clearOAuthCookies, clearSpotifySessionCookies } from "@/lib/spotify/session";

export async function POST() {
  await clearOAuthCookies();
  await clearSpotifySessionCookies();

  return NextResponse.redirect(new URL("/", env.NEXT_PUBLIC_BASE_URL), {
    status: 303,
  });
}
