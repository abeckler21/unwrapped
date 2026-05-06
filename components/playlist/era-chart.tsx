"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

type EraData = { era: string; count: number }

type Props = {
  data: EraData[]
}

export function EraChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)]">Not enough data.</p>
    )
  }

  const maxCount = Math.max(...data.map((d) => d.count))

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} barCategoryGap="30%">
        <XAxis
          dataKey="era"
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          contentStyle={{
            background: "rgba(9,8,14,0.9)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "var(--text-soft)" }}
          itemStyle={{ color: "var(--text-strong)" }}
          formatter={(value) => [`${value as number} tracks`, ""]}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={
                entry.count === maxCount
                  ? "var(--accent)"
                  : "rgba(249,115,22,0.35)"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
