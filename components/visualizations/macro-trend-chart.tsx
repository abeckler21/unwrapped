"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useIsClient } from "@/lib/use-is-client";

type MacroTrendChartProps = {
  type: "area" | "line" | "stacked-bar";
  data: Record<string, number | string>[];
  xKey: string;
  yKeys: Array<{
    key: string;
    label: string;
    color: string;
  }>;
  yAxisLabel?: string;
};

const tooltipStyle = {
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(12, 10, 16, 0.94)",
  color: "#f4f1ea",
};

export function MacroTrendChart({
  type,
  data,
  xKey,
  yKeys,
  yAxisLabel,
}: MacroTrendChartProps) {
  const isClient = useIsClient();

  if (!isClient) {
    return <div className="h-72 w-full rounded-[24px] border border-white/10 bg-white/[0.03]" />;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        {type === "area" ? (
          <AreaChart data={data}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey={xKey} stroke="rgba(244,241,234,0.55)" tickLine={false} />
            <YAxis
              stroke="rgba(244,241,234,0.55)"
              tickLine={false}
              axisLine={false}
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft" } : undefined}
            />
            <Tooltip contentStyle={tooltipStyle} />
            {yKeys.map((series) => (
              <Area
                key={series.key}
                type="monotone"
                dataKey={series.key}
                stroke={series.color}
                fill={series.color}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        ) : null}

        {type === "line" ? (
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey={xKey} stroke="rgba(244,241,234,0.55)" tickLine={false} />
            <YAxis
              stroke="rgba(244,241,234,0.55)"
              tickLine={false}
              axisLine={false}
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft" } : undefined}
            />
            <Tooltip contentStyle={tooltipStyle} />
            {yKeys.map((series) => (
              <Line
                key={series.key}
                type="monotone"
                dataKey={series.key}
                stroke={series.color}
                strokeWidth={3}
                dot={{ r: 3 }}
              />
            ))}
          </LineChart>
        ) : null}

        {type === "stacked-bar" ? (
          <BarChart data={data}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey={xKey} stroke="rgba(244,241,234,0.55)" tickLine={false} />
            <YAxis
              stroke="rgba(244,241,234,0.55)"
              tickLine={false}
              axisLine={false}
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft" } : undefined}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            {yKeys.map((series) => (
              <Bar key={series.key} dataKey={series.key} stackId="macro" fill={series.color} name={series.label} />
            ))}
          </BarChart>
        ) : null}
      </ResponsiveContainer>
    </div>
  );
}
