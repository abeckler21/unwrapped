import type { BubbleScoreResult, ScoreBreakdownItem } from "@/lib/analysis/bubble-score";

type Props = {
  nameA: string;
  nameB: string;
  scoreA: BubbleScoreResult;
  scoreB: BubbleScoreResult;
};

const COMPONENT_LABELS: Record<ScoreBreakdownItem["key"], string> = {
  genreConcentration: "Genre concentration",
  artistRepetition: "Artist repetition",
  popularitySkew: "Popularity skew",
  temporalConsistency: "Taste consistency",
};

const KEYS: ScoreBreakdownItem["key"][] = [
  "genreConcentration",
  "artistRepetition",
  "popularitySkew",
  "temporalConsistency",
];

function Bar({
  score,
  highlight,
}: {
  score: number;
  highlight: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all ${
            highlight ? "bg-[var(--accent)]" : "bg-white/30"
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="w-7 text-right text-xs tabular-nums text-[var(--text-muted)]">
        {Math.round(score)}
      </span>
    </div>
  );
}

export function BreakdownBars({ nameA, nameB, scoreA, scoreB }: Props) {
  return (
    <div className="panel p-6 sm:p-8">
      <p className="eyebrow">Score breakdown</p>
      <p className="mt-1 text-xs text-[var(--text-muted)]">
        Higher = more algorithmically influenced
      </p>

      {/* Column headers */}
      <div className="mt-6 grid grid-cols-[1fr_1fr_1fr] gap-x-4 gap-y-5">
        <div /> {/* label column */}
        <p className="truncate text-xs font-medium text-[var(--text-soft)]">{nameA}</p>
        <p className="truncate text-xs font-medium text-[var(--text-soft)]">{nameB}</p>

        {KEYS.map((key) => {
          const itemA = scoreA.breakdown.find((b) => b.key === key);
          const itemB = scoreB.breakdown.find((b) => b.key === key);
          const valA = itemA?.score ?? 0;
          const valB = itemB?.score ?? 0;

          return (
            <>
              <p key={`${key}-label`} className="self-center text-xs text-[var(--text-muted)]">
                {COMPONENT_LABELS[key]}
              </p>
              <Bar key={`${key}-a`} score={valA} highlight={valA > valB} />
              <Bar key={`${key}-b`} score={valB} highlight={valB > valA} />
            </>
          );
        })}
      </div>
    </div>
  );
}
