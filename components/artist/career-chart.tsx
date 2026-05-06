"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"

type Props = {
  data: { year: number; avgDurationMs: number }[]
}

function msToMin(ms: number) {
  const s = ms / 1000
  return Math.round((s / 60) * 10) / 10
}

export function CareerChart({ data }: Props) {
  if (data.length < 2) {
    return (
      <p className="text-sm text-[var(--text-muted)]">
        Not enough albums to show a trend.
      </p>
    )
  }

  const chartData = data.map((d) => ({
    year: d.year,
    minutes: msToMin(d.avgDurationMs),
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData}>
        <XAxis
          dataKey="year"
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}m`}
          width={32}
        />
        <Tooltip
          cursor={{ stroke: "rgba(255,255,255,0.1)" }}
          contentStyle={{
            background: "rgba(9,8,14,0.9)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "var(--text-soft)" }}
          itemStyle={{ color: "var(--text-strong)" }}
          formatter={(v) => [`${v as number} min avg`, "Song length"]}
        />
        {/* Industry average reference line ~3:30 */}
        <ReferenceLine
          y={3.5}
          stroke="rgba(255,255,255,0.15)"
          strokeDasharray="4 4"
          label={{ value: "Industry avg", position: "right", fontSize: 10, fill: "var(--text-muted)" }}
        />
        <Line
          type="monotone"
          dataKey="minutes"
          stroke="var(--accent)"
          strokeWidth={2}
          dot={{ fill: "var(--accent)", r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
