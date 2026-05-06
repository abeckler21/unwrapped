import { NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE_NAMES } from "@/lib/spotify/constants";

/**
 * Auth middleware.
 *
 * Page routes (/dashboard, /history) intentionally allow unauthenticated access
 * and show demo data — do not redirect them here.
 *
 * API routes under /api/user/* require a valid session cookie. Any future route
 * that returns real user data should be added to that namespace so it is
 * automatically protected without needing per-route auth checks.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /api/user/* routes (none exist yet, but this is the pattern)
  if (pathname.startsWith("/api/user/")) {
    const userId = request.cookies.get(SESSION_COOKIE_NAMES.spotifyUserId)?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/user/:path*"],
};
