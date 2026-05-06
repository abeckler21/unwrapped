import type { BubbleScoreResult } from "@/lib/analysis/bubble-score";
import type { CompareVerdict } from "@/lib/compare/analysis";

type Props = {
  nameA: string;
  nameB: string;
  scoreA: BubbleScoreResult;
  scoreB: BubbleScoreResult;
  verdict: CompareVerdict;
};

export function ScoreDuel({ nameA, nameB, scoreA, scoreB, verdict }: Props) {
  const aIsHigher = verdict.moreCaptured === "a";
  const bIsHigher = verdict.moreCaptured === "b";

  return (
    <div className="panel panel-glow p-6 sm:p-8">
      <p className="eyebrow">Filter Bubble Score</p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        {/* User A */}
        <div className="flex flex-col gap-2">
          <p className="truncate text-sm text-[var(--text-muted)]">{nameA}</p>
          <p
            className={`text-6xl font-semibold tabular-nums tracking-tight sm:text-7xl ${
              aIsHigher ? "text-[var(--accent)]" : "text-[var(--text-strong)]"
            }`}
          >
            {Math.round(scoreA.score)}
          </p>
          <p className="text-sm text-[var(--text-soft)]">{scoreA.tier}</p>
        </div>

        {/* User B */}
        <div className="flex flex-col gap-2 text-right">
          <p className="truncate text-sm text-[var(--text-muted)]">{nameB}</p>
          <p
            className={`text-6xl font-semibold tabular-nums tracking-tight sm:text-7xl ${
              bIsHigher ? "text-[var(--accent)]" : "text-[var(--text-strong)]"
            }`}
          >
            {Math.round(scoreB.score)}
          </p>
          <p className="text-sm text-[var(--text-soft)]">{scoreB.tier}</p>
        </div>
      </div>

      {/* Divider bar showing relative position */}
      <div className="relative mt-6 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[var(--accent)]"
          style={{
            width: `${(scoreA.score / (scoreA.score + scoreB.score)) * 100}%`,
          }}
        />
      </div>
      <div className="mt-1 flex justify-between text-xs text-[var(--text-muted)]">
        <span>{nameA}</span>
        <span>{nameB}</span>
      </div>

      {/* Verdict */}
      <p className="mt-6 text-sm leading-7 text-[var(--text-soft)]">{verdict.summary}</p>
    </div>
  );
}
