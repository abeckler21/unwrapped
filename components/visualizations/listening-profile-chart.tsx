"use client";

import type { ListeningProfile } from "@/lib/analysis/listening-profile";

type Props = {
  profile: ListeningProfile;
  comparison?: Omit<ListeningProfile, "trackCount">;
  userLabel?: string;
  comparisonLabel?: string;
  size?: number;
};

type AxisKey = keyof Omit<ListeningProfile, "trackCount">;

const AXES: { key: AxisKey; label: string }[] = [
  { key: "brevity", label: "Brevity" },
  { key: "recency", label: "Recency" },
  { key: "genreConcentration", label: "Genre" },
  { key: "artistConcentration", label: "Artist" },
];

const N = AXES.length;
const GUIDE_RINGS = [0.25, 0.5, 0.75];
const ACCENT = "#f97316";
const COMPARISON_COLOR = "rgba(255,255,255,0.55)";

// Angle 0 = top (−π/2 in standard math), increasing clockwise.
// SVG coords relative to center:  x = sin(a)*r,  y = −cos(a)*r
function axisCoords(i: number, r: number): { x: number; y: number } {
  const angle = (2 * Math.PI * i) / N;
  return { x: Math.sin(angle) * r, y: -Math.cos(angle) * r };
}

// Build a closed SVG polygon path from per-axis values [0,1] and a max radius
function polygonPath(values: number[], maxRadius: number): string {
  const pts = values.map((v, i) => {
    const { x, y } = axisCoords(i, v * maxRadius);
    return `${x},${y}`;
  });
  return `M ${pts.join(" L ")} Z`;
}

// Guide ring as a closed polygon at fractional radius r
function guidePath(r: number, maxRadius: number): string {
  const pts = AXES.map((_, i) => {
    const { x, y } = axisCoords(i, r * maxRadius);
    return `${x},${y}`;
  });
  return `M ${pts.join(" L ")} Z`;
}

export function ListeningProfileChart({
  profile,
  comparison,
  userLabel = "You",
  comparisonLabel = "Algorithm's ideal",
  size = 260,
}: Props) {
  const maxRadius = Math.floor(size * 0.32);
  const cx = size / 2;
  const cy = size / 2;
  const labelOffset = maxRadius + 20;

  const profileValues = AXES.map((a) => profile[a.key]);
  const comparisonValues = comparison ? AXES.map((a) => comparison[a.key]) : null;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-label="Radar chart comparing listening profile to algorithmic ideal"
        role="img"
        style={{ background: "transparent" }}
      >
        <g transform={`translate(${cx},${cy})`}>

          {/* Guide rings */}
          {GUIDE_RINGS.map((r) => (
            <path
              key={r}
              d={guidePath(r, maxRadius)}
              fill="none"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth={1}
            />
          ))}

          {/* Axis spokes */}
          {AXES.map((_, i) => {
            const { x, y } = axisCoords(i, maxRadius);
            return (
              <line
                key={i}
                x1={0}
                y1={0}
                x2={x}
                y2={y}
                stroke="rgba(255,255,255,0.10)"
                strokeWidth={1}
              />
            );
          })}

          {/* Comparison polygon (dashed, no fill) */}
          {comparisonValues && (
            <path
              d={polygonPath(comparisonValues, maxRadius)}
              fill="none"
              stroke={COMPARISON_COLOR}
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
          )}

          {/* User polygon (filled) */}
          <path
            d={polygonPath(profileValues, maxRadius)}
            fill={ACCENT}
            fillOpacity={0.18}
            stroke={ACCENT}
            strokeWidth={2}
          />

          {/* Axis labels */}
          {AXES.map((axis, i) => {
            const { x, y } = axisCoords(i, labelOffset);
            const anchor = Math.abs(x) < 8 ? "middle" : x > 0 ? "start" : "end";
            const baseline = Math.abs(y) < 8 ? "middle" : y > 0 ? "hanging" : "auto";
            return (
              <text
                key={axis.key}
                x={x}
                y={y}
                textAnchor={anchor}
                dominantBaseline={baseline}
                fontSize={10}
                fill="rgba(244,241,234,0.65)"
                fontFamily="inherit"
              >
                {axis.label}
              </text>
            );
          })}

        </g>
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-5 text-xs text-[var(--text-muted)]">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ background: ACCENT, opacity: 0.85 }}
          />
          {userLabel}
        </span>
        {comparison && (
          <span className="flex items-center gap-1.5">
            <svg width={20} height={2} aria-hidden="true">
              <line
                x1={0}
                y1={1}
                x2={20}
                y2={1}
                stroke={COMPARISON_COLOR}
                strokeWidth={2}
                strokeDasharray="4 3"
              />
            </svg>
            {comparisonLabel}
          </span>
        )}
      </div>
    </div>
  );
}
