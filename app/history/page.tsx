import Image from "next/image";
import Link from "next/link";

import { LineageRail } from "@/components/visualizations/lineage-rail";
import { getGenreHistoriesWithFailures } from "@/lib/ai/genre-history";
import { getCurrentSpotifyProfile } from "@/lib/spotify/current-profile";
import { computeBubbleScore } from "@/lib/analysis/bubble-score";
import type { GenreHistory } from "@/lib/ai/genre-history";

export default async function HistoryPage() {
  const { profile, usingDemoData } = await getCurrentSpotifyProfile();

  const score = computeBubbleScore(profile, "medium_term");
  const topGenres = score.genreDistribution.slice(0, 3).map(g => g.genre);

  // Fall back to a set of foundational genres if the profile has none
  const genresToFetch = topGenres.length > 0
    ? topGenres
    : ["jazz", "hip-hop", "rock"];

  let histories: GenreHistory[] = [];
  let failedGenres: string[] = [];
  let error: string | null = null;

  if (usingDemoData) {
    error = "Log in with Spotify to generate genre histories for your actual top genres.";
  } else try {
    const result = await getGenreHistoriesWithFailures(genresToFetch);
    histories = result.histories;
    failedGenres = result.failedGenres;
  } catch {
    error = "Could not generate genre histories right now. Try again in a moment.";
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-5 py-8 sm:px-8">

      {/* Header */}
      <section>
        <Link
          href="/dashboard"
          className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-[var(--text-soft)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          ← Back to dashboard
        </Link>
        <h1 className="mt-4 text-4xl font-bold text-[var(--text-strong)] sm:text-5xl">
          Music History
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-muted)]">
          The genres you love didn&apos;t appear from nowhere. Every sound has a lineage — a set of
          people, places, and moments that made it possible. Here&apos;s where your listening comes from.
        </p>
        {usingDemoData && (
          <p className="mt-3 text-sm text-[var(--accent)]">
            Showing demo genres.{" "}
            <Link href="/api/auth/login" className="underline">Log in with Spotify</Link>{" "}
            to see histories for your actual top genres.
          </p>
        )}
      </section>

      {error && (
        <div className="panel p-6 text-sm text-[var(--text-muted)]">{error}</div>
      )}

      {!error && failedGenres.length > 0 && (
        <div className="rounded-2xl border border-[rgba(249,115,22,0.35)] bg-[rgba(249,115,22,0.08)] p-4 text-sm leading-6 text-[var(--text-soft)]">
          {failedGenres.length === 1
            ? `One genre history could not be loaded: ${failedGenres[0]}.`
            : `${failedGenres.length} genre histories could not be loaded: ${failedGenres.join(", ")}.`}
        </div>
      )}

      {/* Genre history cards */}
      {histories.map((history, idx) => (
        <article key={idx} className="panel flex flex-col gap-8 p-6 sm:p-10">

          {/* Genre title */}
          <div className="flex flex-col gap-1 border-b border-white/10 pb-6">
            <p className="eyebrow">Genre origin</p>
            <h2 className="text-3xl font-bold text-[var(--accent)]">{history.genre}</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {history.originPlace} &middot; {history.originEra}
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-muted)]">
              {history.culturalContext}
            </p>
          </div>

          {/* Lineage rail */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              Lineage — {history.lineage[0]?.year} → present
            </p>
            <LineageRail nodes={history.lineage} />
          </div>

          {/* Pioneers */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              Pioneering figures
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {history.pioneers.map((pioneer, pIdx) => (
                <div
                  key={pIdx}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  {pioneer.imageUrl ? (
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                      <Image
                        src={pioneer.imageUrl}
                        alt={pioneer.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                      <span className="text-xl font-semibold text-[var(--accent)]">
                        {pioneer.name.trim().charAt(0).toUpperCase() || "?"}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--text-strong)] truncate">{pioneer.name}</p>
                    <p className="text-xs text-[var(--accent)]">{pioneer.years}</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{pioneer.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </article>
      ))}

      {/* Source note */}
      <footer className="border-t border-white/10 pt-6 text-xs text-[var(--text-muted)]">
        Genre histories are generated by AI using{" "}
        {usingDemoData ? "example genres" : "your Spotify listening data"}.
        Pioneer images sourced from Wikipedia / Wikimedia Commons under their respective licenses.
        Historical accuracy is prioritized but AI can make errors — treat as a starting point for further exploration.
      </footer>

    </main>
  );
}
