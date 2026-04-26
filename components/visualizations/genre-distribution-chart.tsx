import { formatPercent } from "@/lib/format";

type GenreDistributionChartProps = {
  data: Array<{
    genre: string;
    share: number;
  }>;
};

const COLORS = [
  "#f97316",
  "#fb7185",
  "#22c55e",
  "#38bdf8",
  "#eab308",
  "#a855f7",
  "#14b8a6",
  "#f43f5e",
];

function buildSegments(data: GenreDistributionChartProps["data"]) {
  const visibleGenres = data.filter((item) => item.share > 0);
  const topGenres = visibleGenres.slice(0, 8);
  const otherShare = visibleGenres
    .slice(8)
    .reduce((sum, item) => sum + item.share, 0);
  const chartData = otherShare > 0
    ? [...topGenres, { genre: "Other", share: otherShare }]
    : topGenres;
  const total = chartData.reduce((sum, item) => sum + item.share, 0) || 1;
  let offset = 0;

  return chartData.map((item, index) => {
    const normalizedShare = (item.share / total) * 100;
    const segment = {
      ...item,
      color: COLORS[index % COLORS.length],
      dash: Math.max(normalizedShare - 0.75, 0),
      offset,
    };

    offset += normalizedShare;
    return segment;
  });
}

export function GenreDistributionChart({ data }: GenreDistributionChartProps) {
  const segments = buildSegments(data);
  const primaryGenre = data[0];

  if (!segments.length || !primaryGenre) {
    return (
      <div className="flex h-72 w-full items-center justify-center rounded-[24px] border border-white/10 bg-white/[0.03] text-sm text-[var(--text-muted)]">
        No genre distribution available.
      </div>
    );
  }

  return (
    <div
      className="relative flex h-72 w-full items-center justify-center overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03]"
      role="img"
      aria-label={`Genre distribution led by ${primaryGenre.genre} at ${formatPercent(primaryGenre.share)}.`}
    >
      <svg className="h-full max-h-64 w-full max-w-64" viewBox="0 0 220 220">
        <circle
          cx="110"
          cy="110"
          r="78"
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="30"
        />
        {segments.map((segment) => (
          <circle
            key={segment.genre}
            cx="110"
            cy="110"
            r="78"
            fill="none"
            pathLength={100}
            stroke={segment.color}
            strokeDasharray={`${segment.dash} ${100 - segment.dash}`}
            strokeDashoffset={-segment.offset}
            strokeLinecap="round"
            strokeWidth="30"
            transform="rotate(-90 110 110)"
          >
            <title>{`${segment.genre}: ${formatPercent(segment.share)}`}</title>
          </circle>
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
        <p className="max-w-32 truncate text-sm font-semibold capitalize text-[var(--text-strong)]">
          {primaryGenre.genre}
        </p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-[var(--accent)]">
          {formatPercent(primaryGenre.share)}
        </p>
        <p className="mt-1 text-xs uppercase tracking-widest text-[var(--text-muted)]">
          top genre
        </p>
      </div>
    </div>
  );
}
