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
import type { AlbumAnalysis } from "@/lib/artist/analysis"

type Props = {
  albums: AlbumAnalysis[]
}

export function AoiChart({ albums }: Props) {
  if (albums.length === 0) {
    return <p className="text-sm text-[var(--text-muted)]">No album data.</p>
  }

  const data = albums.map((a) => ({
    name: a.name.length > 18 ? a.name.slice(0, 16) + "…" : a.name,
    aoi: a.aoi,
    year: a.releaseYear,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barCategoryGap="25%">
        <XAxis
          dataKey="name"
          tick={{ fill: "var(--text-muted)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-35}
          textAnchor="end"
          height={60}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
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
          formatter={(v, _name, props) => [
            `AOI: ${v as number}`,
            (props as { payload?: { year?: number } })?.payload?.year
              ? String((props as { payload?: { year?: number } }).payload?.year)
              : "",
          ]}
        />
        <Bar dataKey="aoi" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={
                entry.aoi >= 70
                  ? "var(--accent)"
                  : entry.aoi >= 40
                    ? "rgba(249,115,22,0.6)"
                    : "rgba(249,115,22,0.25)"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
