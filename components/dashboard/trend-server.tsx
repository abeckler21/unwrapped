import { BubbleScoreTrendChart } from "@/components/visualizations/bubble-score-trend-chart";
import {
  generateTrendNarrative,
  getVisitHistory,
  recordVisit,
} from "@/lib/analysis/visit-tracking";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/[0.07] ${className}`} />;
}

export function TrendSkeleton() {
  return (
    <section className="panel flex flex-col gap-4 p-6 sm:p-8">
      <div className="flex flex-col gap-2">
        <SkeletonBlock className="h-3 w-36" />
        <SkeletonBlock className="h-6 w-52" />
        <SkeletonBlock className="h-4 w-full max-w-lg" />
      </div>
      <SkeletonBlock className="h-40 w-full rounded-2xl" />
    </section>
  );
}

interface Props {
  userId: string;
  bubbleScore: number;
  usingDemoData: boolean;
}

export async function TrendServer({ userId, bubbleScore, usingDemoData }: Props) {
  if (usingDemoData) return null;

  try {
    await recordVisit(userId, bubbleScore);
    const visitHistory = await getVisitHistory(userId);

    if (visitHistory.length < 2) {
      return (
        <section className="panel flex flex-col gap-2 p-6">
          <p className="text-sm font-medium text-[var(--text-strong)]">Your trend starts here</p>
          <p className="text-sm text-[var(--text-muted)]">
            Come back in a few days and this section will show whether your filter bubble is
            widening or narrowing over time.
          </p>
        </section>
      );
    }

    const trendNarrative = await generateTrendNarrative(visitHistory);

    return (
      <section className="panel flex flex-col gap-4 p-6 sm:p-8">
        <div className="flex flex-col gap-1">
          <p className="eyebrow">Filter bubble over time</p>
          <h2 className="text-lg font-semibold text-[var(--text-strong)]">
            Your score across visits
          </h2>
          {trendNarrative && (
            <p className="text-sm leading-7 text-[var(--text-muted)]">{trendNarrative}</p>
          )}
        </div>
        <BubbleScoreTrendChart
          data={visitHistory.map((v) => ({
            label: new Date(v.visitedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            score: v.bubbleScore,
          }))}
        />
        <p className="text-xs text-[var(--text-muted)]">
          Dashed lines mark tier boundaries: Wide Open / Narrowing / In the Loop / Deep in the
          Algorithm
        </p>
      </section>
    );
  } catch {
    // Supabase or LLM error — trend section disappears silently rather than crashing the page
    return null;
  }
}
