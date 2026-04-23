"use client";

import { ReactNode, useRef } from "react";

import { useElementSize } from "@/lib/use-element-size";
import { useIsClient } from "@/lib/use-is-client";

type ChartFrameProps = {
  height?: number;
  children: (size: { width: number; height: number }) => ReactNode;
};

export function ChartFrame({ height = 288, children }: ChartFrameProps) {
  const isClient = useIsClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const size = useElementSize(containerRef);

  if (!isClient) {
    return <div className="w-full rounded-[24px] border border-white/10 bg-white/[0.03]" style={{ height }} />;
  }

  return (
    <div ref={containerRef} className="w-full min-w-0" style={{ height }}>
      {size.width > 0 ? (
        children({ width: size.width, height })
      ) : (
        <div className="h-full w-full rounded-[24px] border border-white/10 bg-white/[0.03]" />
      )}
    </div>
  );
}
