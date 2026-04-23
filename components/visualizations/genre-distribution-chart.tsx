"use client";

import { Cell, Pie, PieChart, Tooltip } from "recharts";

import { ChartFrame } from "@/components/visualizations/chart-frame";

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
  const chartData = data.slice(0, 8);

  return (
    <ChartFrame>
      {({ width, height }) => (
        <PieChart width={width} height={height}>
          <Pie
            data={chartData}
            dataKey="share"
            nameKey="genre"
            cx="50%"
            cy="50%"
            innerRadius={Math.min(width, height) * 0.19}
            outerRadius={Math.min(width, height) * 0.34}
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
      )}
    </ChartFrame>
  );
}
