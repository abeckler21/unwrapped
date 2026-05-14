"use client"

import dynamic from "next/dynamic"

const WorldGenreMapDynamic = dynamic(
  () =>
    import("@/components/visualizations/world-genre-map").then(
      (m) => m.WorldGenreMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] items-center justify-center rounded-2xl border border-white/8 bg-white/[0.02]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[var(--accent)]" />
          <p className="text-sm text-[var(--text-muted)]">Loading map&hellip;</p>
        </div>
      </div>
    ),
  },
)

export function WorldGenreMapLoader() {
  return <WorldGenreMapDynamic />
}
