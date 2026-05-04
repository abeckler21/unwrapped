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

  // Temporal tracking — record today's score and fetch history (real users only)
  const currentScore = usingDemoData ? null : computeBubbleScore(profile, 'medium_term');
  if (!usingDemoData && currentScore) {
    await recordVisit(profile.userId, currentScore.score);
  }
  const visitHistory = usingDemoData ? [] : await getVisitHistory(profile.userId);
  const trendNarrative = await generateTrendNarrative(visitHistory);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
      <section className="panel flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Data source</p>
          <h2 className="text-2xl font-semibold text-[var(--text-strong)]">
            {usingDemoData ? "Demo profile is active" : "Live Spotify profile is active"}
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
            {usingDemoData
              ? needsReconnect
                ? "Your Spotify session needs to be refreshed. Log in again to reload live data; until then, the dashboard is showing the seeded fallback profile."
                : "You are viewing the seeded fallback profile. Use Spotify login once your app and Supabase project are fully configured."
              : profile.fetchedFromCache
                ? "This dashboard loaded from the 24-hour Supabase cache instead of hitting Spotify again."
                : "This dashboard loaded directly from Spotify and refreshed the cache."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {isAuthenticated ? (
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="button-secondary">
                Log out
              </button>
            </form>
          ) : (
            <Link href="/api/auth/login" className="button-primary">
              Log in with Spotify
            </Link>
          )}
          <Link href="/history" className="button-secondary">
            Music history
          </Link>
          <Link href="/setup" className="button-secondary">
            Setup checklist
          </Link>
        </div>
      </section>

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
