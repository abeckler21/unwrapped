"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { useIsClient } from "@/lib/use-is-client";

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

export function GenreDistributionChart({ data }: GenreDistributionChartProps) {
  const isClient = useIsClient();
  const chartData = data.slice(0, 8);

  if (!isClient) {
    return <div className="h-72 w-full rounded-[24px] border border-white/10 bg-white/[0.03]" />;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="share"
            nameKey="genre"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={2}
          >
            {chartData.map((entry, index) => (
              <Cell key={entry.genre} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(12, 10, 16, 0.92)",
              color: "#f4f1ea",
            }}
            formatter={(value) => `${Number(value ?? 0)}%`}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
