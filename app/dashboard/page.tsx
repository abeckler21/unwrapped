import Link from "next/link";

import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { getOrGenerateArchetype } from "@/lib/ai/archetype";
import { computeBubbleScore } from "@/lib/analysis/bubble-score";
import { recordVisit, getVisitHistory, generateTrendNarrative } from "@/lib/analysis/visit-tracking";
import type { BubbleScoreResult } from "@/lib/analysis/bubble-score";
import type { VisitRecord } from "@/lib/analysis/visit-tracking";
import { getCurrentSpotifyProfile } from "@/lib/spotify/current-profile";
import type { TimeRange } from "@/lib/types/spotify";

type DashboardPageProps = {
  searchParams?: Promise<{
    range?: string | string[];
  }>;
};

const VALID_TIME_RANGES: TimeRange[] = ["short_term", "medium_term", "long_term"];

function parseRange(value: string | string[] | undefined): TimeRange {
  const candidate = Array.isArray(value) ? value[0] : value;
  return VALID_TIME_RANGES.includes(candidate as TimeRange)
    ? (candidate as TimeRange)
    : "medium_term";
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const range = parseRange((await searchParams)?.range);
  const { profile, usingDemoData, isAuthenticated, needsReconnect } =
    await getCurrentSpotifyProfile();

  const scoresByRange: Record<TimeRange, BubbleScoreResult> = {
    short_term: computeBubbleScore(profile, "short_term"),
    medium_term: computeBubbleScore(profile, "medium_term"),
    long_term: computeBubbleScore(profile, "long_term"),
  };

  let visitHistory: VisitRecord[] = [];
  let trendNarrative: string | null = null;

  const archetypePromise = getOrGenerateArchetype(
    profile,
    usingDemoData,
    scoresByRange.medium_term,
  );

  if (!usingDemoData) {
    await Promise.all([
      archetypePromise,
      recordVisit(profile.userId, scoresByRange.medium_term.score),
    ]);
    visitHistory = await getVisitHistory(profile.userId);
    trendNarrative = await generateTrendNarrative(visitHistory);
  }

  const archetype = await archetypePromise;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {usingDemoData ? (
            <p className="text-sm text-[var(--text-muted)]">
              {needsReconnect
                ? "Your session expired — "
                : "Showing a preview — "}
              <Link href="/api/auth/login" className="text-[var(--accent)] hover:underline">
                log in with Spotify
              </Link>{" "}
              to see your real data.
            </p>
          ) : (
            <div>
              <p className="eyebrow">Welcome {profile.displayName}</p>
              <h1 className="mt-1 text-3xl font-bold text-[var(--text-strong)] sm:text-4xl">
                This is you: <span className="text-[var(--accent)]">Unwrapped</span>
              </h1>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAuthenticated ? (
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="button-secondary text-sm px-4 py-2">
                Log out
              </button>
            </form>
          ) : (
            <Link href="/api/auth/login" className="button-primary text-sm px-4 py-2">
              Log in with Spotify
            </Link>
          )}
        </div>
      </div>

      <DashboardContent
        profile={profile}
        usingDemoData={usingDemoData}
        initialRange={range}
        scoresByRange={scoresByRange}
        archetype={archetype}
        visitHistory={visitHistory}
        trendNarrative={trendNarrative}
      />
    </main>
  );
}
