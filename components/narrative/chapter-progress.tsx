"use client"

import { useEffect, useState } from "react"

const CHAPTERS = [
  { id: "ch-1", label: "Where You Are" },
  { id: "ch-2", label: "How You Got Here" },
  { id: "ch-3", label: "What the Industry Did" },
  { id: "ch-4", label: "What You're Missing" },
  { id: "ch-5", label: "What to Do About It" },
]

export function ChapterProgress() {
  const [activeId, setActiveId] = useState("ch-1")

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    CHAPTERS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveId(id)
        },
        { threshold: 0.35 },
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach((obs) => obs.disconnect())
  }, [])

  const activeIndex = CHAPTERS.findIndex(({ id }) => id === activeId)
  const activeChapter = CHAPTERS[activeIndex] ?? CHAPTERS[0]

  return (
    <>
      {/* Desktop: vertical dot rail on the right */}
      <nav
        aria-label="Chapter navigation"
        className="fixed right-5 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-4 lg:flex"
      >
        {CHAPTERS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            title={label}
            aria-label={`Jump to: ${label}`}
            onClick={() =>
              document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
            }
            className="group flex items-center justify-end gap-2"
          >
            <span
              className={`text-[10px] tracking-wide transition-all duration-200 ${
                activeId === id
                  ? "opacity-70 text-[var(--accent)]"
                  : "opacity-0 group-hover:opacity-40 text-[var(--text-muted)]"
              }`}
            >
              {label}
            </span>
            <span
              className={`block rounded-full transition-all duration-300 ${
                activeId === id
                  ? "h-2 w-2 bg-[var(--accent)]"
                  : "h-1.5 w-1.5 bg-white/25 group-hover:bg-white/50"
              }`}
            />
          </button>
        ))}
      </nav>

      {/* Mobile: fixed bottom bar with dots + chapter label */}
      <nav
        aria-label="Chapter navigation"
        className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-3 border-t border-white/8 bg-[rgba(9,8,14,0.88)] px-5 py-3 backdrop-blur-xl lg:hidden"
      >
        <div className="flex items-center gap-2">
          {CHAPTERS.map(({ id }, i) => (
            <button
              key={id}
              type="button"
              aria-label={`Jump to chapter ${i + 1}`}
              onClick={() =>
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
              }
              className={`rounded-full transition-all duration-300 ${
                activeId === id
                  ? "h-2 w-2 bg-[var(--accent)]"
                  : "h-1.5 w-1.5 bg-white/25"
              }`}
            />
          ))}
        </div>
        <span className="text-[11px] text-[var(--text-muted)]">
          {activeIndex + 1} / {CHAPTERS.length} · {activeChapter.label}
        </span>
      </nav>
    </>
  )
}
