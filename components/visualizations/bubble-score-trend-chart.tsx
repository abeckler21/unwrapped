"use client";

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";
import { ChartFrame } from "@/components/visualizations/chart-frame";

type DataPoint = { label: string; score: number };

type Props = { data: DataPoint[] };

const tooltipStyle = {
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(12, 10, 16, 0.94)",
  color: "#f4f1ea",
};

export function BubbleScoreTrendChart({ data }: Props) {
  return (
    <ChartFrame height={200}>
      {({ width, height }) => (
        <LineChart width={width} height={height} data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="label"
            tick={{ fill: "rgba(244,241,234,0.45)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "rgba(244,241,234,0.45)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) => [`${value}`, "Bubble score"]}
          />
          {/* tier thresholds */}
          <ReferenceLine y={30} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
          <ReferenceLine y={55} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
          <ReferenceLine y={75} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey="score"
            stroke="var(--accent)"
            strokeWidth={2}
            dot={{ fill: "var(--accent)", r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      )}
    </ChartFrame>
  );
}
