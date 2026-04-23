import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Unwrapped",
  description: "The dark side of Spotify Wrapped.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <div className="app-shell">
          <header className="sticky top-0 z-30 border-b border-white/8 bg-[rgba(9,8,14,0.78)] backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
              <Link href="/" className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.35),_rgba(56,189,248,0.18))] text-sm font-medium text-[var(--text-strong)]">
                  U
                </span>
                <div>
                  <p className="font-medium tracking-[0.18em] text-[var(--text-strong)] uppercase">
                    Unwrapped
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">the dark side of Wrapped</p>
                </div>
              </Link>

              <nav className="flex items-center gap-3 text-sm">
                <Link href="/dashboard" className="button-secondary">
                  Dashboard
                </Link>
                <Link href="/share/demo-user" className="button-primary">
                  Share preview
                </Link>
              </nav>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
