"use client";

import { useRef } from "react";
import { useElementSize } from "@/lib/use-element-size";
import { useIsClient } from "@/lib/use-is-client";
import type { LineageNode } from "@/lib/ai/genre-history";

type Props = {
  nodes: LineageNode[];
  accentColor?: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function truncateText(text: string, maxChars: number) {
  if (text.length <= maxChars) {
    return text;
  }

  return `${text.slice(0, Math.max(1, maxChars - 1)).trimEnd()}…`;
}

function getTextAnchor(index: number, total: number) {
  if (index === 0) {
    return "start";
  }

  if (index === total - 1) {
    return "end";
  }

  return "middle";
}

export function LineageRail({ nodes, accentColor = "var(--accent)" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width } = useElementSize(containerRef);
  const isClient = useIsClient();

  const HEIGHT = 120;
  const PADDING_X = 32;
  const NODE_R = 7;
  const TRACK_Y = 60;

  if (!isClient || width === 0) {
    return (
      <div
        ref={containerRef}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.03]"
        style={{ height: HEIGHT }}
      />
    );
  }

  const usable = Math.max(width - PADDING_X * 2, 0);
  const step = nodes.length > 1 ? usable / (nodes.length - 1) : 0;

  return (
    <div ref={containerRef} className="w-full overflow-hidden">
      <svg width={width} height={HEIGHT} aria-label="Genre lineage timeline">
        {/* Track line */}
        <line
          x1={PADDING_X}
          y1={TRACK_Y}
          x2={width - PADDING_X}
          y2={TRACK_Y}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={2}
        />

        {nodes.map((node, i) => {
          const cx = PADDING_X + i * step;
          const isFirst = i === 0;
          const isLast = i === nodes.length - 1;
          const labelY = i % 2 === 0 ? TRACK_Y - 22 : TRACK_Y + 36;
          const noteY = i % 2 === 0 ? TRACK_Y - 36 : TRACK_Y + 50;
          const textAnchor = getTextAnchor(i, nodes.length);
          const slotWidth = nodes.length > 1
            ? (isFirst || isLast ? step * 0.9 : step * 0.82)
            : usable;
          const labelMaxChars = clamp(Math.floor(slotWidth / 6.1), 8, 40);
          const noteMaxChars = clamp(Math.floor(slotWidth / 5.2), 12, 60);

          return (
            <g key={i}>
              <title>{`${node.year}: ${node.label} — ${node.note}`}</title>

              {/* Connector tick */}
              <line
                x1={cx}
                y1={TRACK_Y - NODE_R}
                x2={cx}
                y2={TRACK_Y + NODE_R}
                stroke={isFirst || isLast ? accentColor : "rgba(255,255,255,0.3)"}
                strokeWidth={1.5}
              />

              {/* Node dot */}
              <circle
                cx={cx}
                cy={TRACK_Y}
                r={NODE_R}
                fill={isFirst || isLast ? accentColor : "rgba(255,255,255,0.15)"}
                stroke={isFirst || isLast ? accentColor : "rgba(255,255,255,0.25)"}
                strokeWidth={1.5}
              />

              {/* Year */}
              <text
                x={cx}
                y={TRACK_Y + (i % 2 === 0 ? -12 : 24)}
                textAnchor="middle"
                fontSize={10}
                fill="rgba(244,241,234,0.4)"
                fontFamily="inherit"
              >
                {node.year}
              </text>

              {/* Label */}
              <text
                x={cx}
                y={labelY}
                textAnchor={textAnchor}
                fontSize={11}
                fontWeight={isFirst || isLast ? 600 : 400}
                fill={isFirst || isLast ? "var(--text-strong)" : "rgba(244,241,234,0.75)"}
                fontFamily="inherit"
              >
                {truncateText(node.label, labelMaxChars)}
              </text>

              {/* Note — only on hover effect not possible in SVG without JS, show on desktop for alternating */}
              {width > 600 && (
                <text
                  x={cx}
                  y={noteY}
                  textAnchor={textAnchor}
                  fontSize={9}
                  fill="rgba(244,241,234,0.35)"
                  fontFamily="inherit"
                >
                  {truncateText(node.note, noteMaxChars)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
