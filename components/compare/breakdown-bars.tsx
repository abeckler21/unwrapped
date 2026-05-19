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
  temporalConsistency: "Taste consistency",
};

const KEYS: ScoreBreakdownItem["key"][] = [
  "genreConcentration",
  "artistRepetition",
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

      {/* Desktop: 3-column grid. Mobile: stacked rows. */}

      {/* Desktop headers */}
      <div className="mt-6 hidden sm:grid sm:grid-cols-[1fr_1fr_1fr] sm:gap-x-4">
        <div />
        <p className="truncate text-xs font-medium text-[var(--text-soft)]">{nameA}</p>
        <p className="truncate text-xs font-medium text-[var(--text-soft)]">{nameB}</p>
      </div>

      {/* Rows */}
      <div className="mt-4 flex flex-col gap-5 sm:mt-2">
        {KEYS.map((key) => {
          const itemA = scoreA.breakdown.find((b) => b.key === key);
          const itemB = scoreB.breakdown.find((b) => b.key === key);
          const valA = itemA?.score ?? 0;
          const valB = itemB?.score ?? 0;

          return (
            <div key={key}>
              {/* Label */}
              <p className="mb-2 text-xs text-[var(--text-muted)] sm:hidden">
                {COMPONENT_LABELS[key]}
              </p>

              {/* Desktop row */}
              <div className="hidden sm:grid sm:grid-cols-[1fr_1fr_1fr] sm:items-center sm:gap-x-4">
                <p className="text-xs text-[var(--text-muted)]">{COMPONENT_LABELS[key]}</p>
                <Bar score={valA} highlight={valA > valB} />
                <Bar score={valB} highlight={valB > valA} />
              </div>

              {/* Mobile: stacked user rows */}
              <div className="flex flex-col gap-2 sm:hidden">
                <div className="flex items-center gap-2">
                  <span className="w-20 shrink-0 truncate text-xs text-[var(--text-soft)]">{nameA}</span>
                  <div className="flex flex-1 items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full transition-all ${valA > valB ? "bg-[var(--accent)]" : "bg-white/30"}`}
                        style={{ width: `${valA}%` }}
                      />
                    </div>
                    <span className="w-7 text-right text-xs tabular-nums text-[var(--text-muted)]">{Math.round(valA)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-20 shrink-0 truncate text-xs text-[var(--text-soft)]">{nameB}</span>
                  <div className="flex flex-1 items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full transition-all ${valB > valA ? "bg-[var(--accent)]" : "bg-white/30"}`}
                        style={{ width: `${valB}%` }}
                      />
                    </div>
                    <span className="w-7 text-right text-xs tabular-nums text-[var(--text-muted)]">{Math.round(valB)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
