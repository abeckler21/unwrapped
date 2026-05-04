import type { Metadata } from "next";
import Link from "next/link";
import { getSpotifySession } from "@/lib/spotify/session";
import "./globals.css";

export const metadata: Metadata = {
  title: "Unwrapped — Know your listening",
  description: "See how Spotify's algorithm has shaped your taste. Filter Bubble Score, genre history, and listener archetype — built from your actual listening data.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSpotifySession();
  const hasActiveSession = Boolean(session.spotifyUserId && session.accessToken);

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <div className="app-shell">
          <header className="sticky top-0 z-30 border-b border-white/8 bg-[rgba(9,8,14,0.78)] backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">

              <Link href="/" className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.35),_rgba(56,189,248,0.18))] text-sm font-bold text-[var(--text-strong)]">
                  U
                </span>
                <span className="font-semibold tracking-[0.14em] text-[var(--text-strong)] uppercase text-sm">
                  Unwrapped
                </span>
              </Link>

              <nav className="flex items-center gap-2 text-sm">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-[var(--text-muted)] hover:text-[var(--text-strong)] transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/history"
                  className="px-4 py-2 text-[var(--text-muted)] hover:text-[var(--text-strong)] transition-colors"
                >
                  History
                </Link>
                {hasActiveSession ? (
                  <form action="/api/auth/logout" method="post" className="ml-2">
                    <button type="submit" className="button-secondary text-sm">
                      Log out
                    </button>
                  </form>
                ) : (
                  <Link href="/api/auth/login" className="button-primary ml-2">
                    Log in with Spotify
                  </Link>
                )}
              </nav>

            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
