import type { PlaylistAutopsy } from "@/lib/playlist/autopsy"

type Props = {
  autopsy: PlaylistAutopsy
}

const CLASSIFICATION_COLORS: Record<PlaylistAutopsy["classification"], string> = {
  Algorithmic: "text-orange-400 border-orange-500/20 bg-orange-500/10",
  "Human-curated": "text-green-400 border-green-500/20 bg-green-500/10",
  Mixed: "text-sky-400 border-sky-500/20 bg-sky-500/10",
}

const SCORE_LABELS: Record<keyof PlaylistAutopsy["scoreBreakdown"], string> = {
  nameSignal: "Algorithmic name",
  ownerSignal: "Spotify-owned",
  recencySignal: "Recency bias",
  homogeneitySignal: "Genre homogeneity",
}

const SCORE_MAX: Record<keyof PlaylistAutopsy["scoreBreakdown"], number> = {
  nameSignal: 35,
  ownerSignal: 25,
  recencySignal: 25,
  homogeneitySignal: 15,
}

function fmt(ms: number) {
  const s = Math.round(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
}

export function AlgorithmScoreCard({ autopsy }: Props) {
  const classColor = CLASSIFICATION_COLORS[autopsy.classification]

  return (
    <div className="panel p-6 sm:p-8 flex flex-col gap-6">
      {/* Score header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">Algorithm Score</p>
          <div className="mt-1 flex items-end gap-3">
            <span className="text-5xl font-bold tabular-nums text-[var(--text-strong)]">
              {autopsy.algorithmScore}
            </span>
            <span className="mb-1 text-lg text-[var(--text-muted)]">/ 100</span>
          </div>
        </div>
        <span className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium ${classColor}`}>
          {autopsy.classification}
        </span>
      </div>

      {/* Score bar */}
      <div className="h-2 w-full rounded-full bg-white/8 overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-all"
          style={{ width: `${autopsy.algorithmScore}%` }}
        />
      </div>

      {/* Breakdown */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
          Score breakdown
        </p>
        {(Object.entries(autopsy.scoreBreakdown) as [keyof PlaylistAutopsy["scoreBreakdown"], number][]).map(
          ([key, val]) => {
            const max = SCORE_MAX[key]
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="w-40 shrink-0 text-xs text-[var(--text-soft)]">
                  {SCORE_LABELS[key]}
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--accent)]/60"
                    style={{ width: `${(val / max) * 100}%` }}
                  />
                </div>
                <span className="w-10 text-right text-xs tabular-nums text-[var(--text-muted)]">
                  {val}/{max}
                </span>
              </div>
            )
          },
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 border-t border-white/8 pt-5">
        <div>
          <p className="text-xs text-[var(--text-muted)]">Tracks</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-[var(--text-strong)]">
            {autopsy.tracks.length}
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-muted)]">Avg duration</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-[var(--text-strong)]">
            {fmt(autopsy.meanDurationMs)}
          </p>
        </div>
      </div>
    </div>
  )
}
