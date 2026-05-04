import Link from "next/link";

import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { getOrGenerateArchetype } from "@/lib/ai/archetype";
import { computeBubbleScore } from "@/lib/analysis/bubble-score";
import { recordVisit, getVisitHistory, generateTrendNarrative } from "@/lib/analysis/visit-tracking";
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
  const archetype = await getOrGenerateArchetype(profile, usingDemoData);

  const currentScore = usingDemoData ? null : computeBubbleScore(profile, "medium_term");
  if (!usingDemoData && currentScore) {
    await recordVisit(profile.userId, currentScore.score);
  }
  const visitHistory = usingDemoData ? [] : await getVisitHistory(profile.userId);
  const trendNarrative = await generateTrendNarrative(visitHistory);

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
            <p className="text-sm text-[var(--text-muted)]">
              Logged in as{" "}
              <span className="text-[var(--text-strong)]">{profile.displayName}</span>
            </p>
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
        range={range}
        archetype={archetype}
        visitHistory={visitHistory}
        trendNarrative={trendNarrative}
      />
    </main>
  );
}
