"use client"

import { useState, useCallback, memo } from "react"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — react-simple-maps v3 ships without bundled .d.ts; @types/react-simple-maps covers it
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps"
import {
  AVAILABLE_YEARS,
  GENRE_COLORS,
  GENRE_LABELS,
  GenreKey,
  getCountryName,
  getDistributionAtYear,
  getSortedGenres,
  getTopGenre,
  hasSpecificData,
} from "@/lib/data/global-genres"

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

type TooltipState = {
  x: number
  y: number
  isoNumeric: string
  name: string
} | null

// ── Legend ──────────────────────────────────────────────────────────────────
const LEGEND_GENRES: GenreKey[] = [
  "pop", "hipHop", "rock", "electronic", "latin", "rnb", "kpop", "afrobeats", "jpop", "bollywood",
]

function Legend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      {LEGEND_GENRES.map((g) => (
        <div key={g} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full flex-shrink-0"
            style={{ background: GENRE_COLORS[g] }}
          />
          <span className="text-xs text-[var(--text-muted)]">{GENRE_LABELS[g]}</span>
        </div>
      ))}
    </div>
  )
}

// ── Tooltip ─────────────────────────────────────────────────────────────────
function Tooltip({
  state,
  year,
}: {
  state: TooltipState
  year: number
}) {
  if (!state) return null
  const dist = getDistributionAtYear(state.isoNumeric, year)
  const sorted = getSortedGenres(dist).slice(0, 5)
  const isEstimated = !hasSpecificData(state.isoNumeric)

  return (
    <div
      className="pointer-events-none fixed z-50 min-w-[180px] rounded-xl border border-white/10 bg-[rgba(9,8,14,0.95)] p-3 shadow-xl backdrop-blur-xl"
      style={{ left: state.x + 14, top: state.y - 10 }}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-[var(--text-strong)]">
          {state.name}
        </span>
        {isEstimated && (
          <span className="rounded bg-white/5 px-1 py-0.5 text-[10px] text-[var(--text-muted)]">
            est.
          </span>
        )}
      </div>
      <div className="space-y-1.5">
        {sorted.map(([genre, share]) => (
          <div key={genre} className="flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full flex-shrink-0"
              style={{ background: GENRE_COLORS[genre] }}
            />
            <span className="flex-1 text-xs text-[var(--text-soft)]">
              {GENRE_LABELS[genre]}
            </span>
            <span className="text-xs font-semibold tabular-nums text-[var(--text-strong)]">
              {share}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Country detail panel ────────────────────────────────────────────────────
function CountryPanel({
  isoNumeric,
  year,
  onClose,
}: {
  isoNumeric: string
  year: number
  onClose: () => void
}) {
  const dist = getDistributionAtYear(isoNumeric, year)
  const sorted = getSortedGenres(dist)
  const total = sorted.reduce((s, [, v]) => s + v, 0) || 1
  const isEstimated = !hasSpecificData(isoNumeric)
  const topGenre = sorted[0]?.[0] ?? "pop"

  return (
    <div className="panel p-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: GENRE_COLORS[topGenre] }}
          >
            {GENRE_LABELS[topGenre]}
          </p>
          <h3 className="mt-0.5 text-lg font-bold text-[var(--text-strong)]">
            {getCountryName(isoNumeric)}
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            Genre breakdown &middot; {year}
            {isEstimated && " (estimated)"}
          </p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-white/10 text-[var(--text-muted)] hover:text-[var(--text-strong)] transition-colors"
          aria-label="Close"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="space-y-2.5">
        {sorted.map(([genre, share]) => {
          const pct = (share / total) * 100
          return (
            <div key={genre}>
              <div className="mb-1 flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs text-[var(--text-soft)]">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: GENRE_COLORS[genre] }}
                  />
                  {GENRE_LABELS[genre]}
                </span>
                <span className="text-xs font-semibold tabular-nums text-[var(--text-strong)]">
                  {share}%
                </span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: GENRE_COLORS[genre],
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {isEstimated && (
        <p className="mt-4 text-[11px] leading-relaxed text-[var(--text-muted)]">
          Estimated from regional trends. Specific chart data not available for this country.
        </p>
      )}
    </div>
  )
}

// ── Year scrubber ────────────────────────────────────────────────────────────
function YearScrubber({
  year,
  onChange,
}: {
  year: number
  onChange: (y: number) => void
}) {
  const idx = AVAILABLE_YEARS.indexOf(year)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-muted)] font-mono tracking-widest uppercase">
          Year
        </span>
        <span
          className="text-2xl font-bold tabular-nums"
          style={{ color: "var(--accent)" }}
        >
          {year}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={AVAILABLE_YEARS.length - 1}
        step={1}
        value={idx === -1 ? 0 : idx}
        onChange={(e) => onChange(AVAILABLE_YEARS[parseInt(e.target.value)])}
        className="year-scrubber w-full"
        aria-label="Select year"
      />
      <div className="flex justify-between">
        {AVAILABLE_YEARS.map((y) => (
          <button
            key={y}
            onClick={() => onChange(y)}
            className={`text-[10px] tabular-nums transition-colors ${
              y === year
                ? "font-semibold text-[var(--accent)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-soft)]"
            }`}
          >
            {y}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Main map component ───────────────────────────────────────────────────────
function WorldGenreMapInner() {
  const [year, setYear] = useState(2024)
  const [tooltip, setTooltip] = useState<TooltipState>(null)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)

  const getFill = useCallback(
    (geoId: string) => {
      const topGenre = getTopGenre(geoId, year)
      return GENRE_COLORS[topGenre] + "99" // 60% opacity base
    },
    [year],
  )

  const handleMouseEnter = useCallback(
    (geo: { id: string; properties: { NAME?: string } }, evt: React.MouseEvent) => {
      const name = geo.properties.NAME ?? getCountryName(geo.id)
      setTooltip({ x: evt.clientX, y: evt.clientY, isoNumeric: geo.id, name })
    },
    [],
  )

  const handleMouseMove = useCallback((evt: React.MouseEvent) => {
    setTooltip((t) => (t ? { ...t, x: evt.clientX, y: evt.clientY } : null))
  }, [])

  const handleMouseLeave = useCallback(() => {
    setTooltip(null)
  }, [])

  const handleClick = useCallback((geo: { id: string }) => {
    setSelectedCountry((prev) => (prev === geo.id ? null : geo.id))
  }, [])

  return (
    <div className="flex flex-col gap-6">
      {/* Scrubber */}
      <YearScrubber year={year} onChange={setYear} />

      {/* Map + side panel */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
        {/* Map */}
        <div
          className="relative flex-1 overflow-hidden rounded-2xl border border-white/8 bg-[rgba(255,255,255,0.02)]"
          style={{ minHeight: 280 }}
        >
          <ComposableMap
            projection="geoNaturalEarth1"
            projectionConfig={{ scale: 140 }}
            style={{ width: "100%", height: "100%" }}
            width={800}
            height={420}
          >
            <ZoomableGroup zoom={1} minZoom={1} maxZoom={6}>
              <Geographies geography={GEO_URL}>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {({ geographies }: { geographies: any[] }) =>
                  geographies.map((geo) => {
                    const isSelected = selectedCountry === geo.id
                    const fill = getFill(geo.id)
                    const name = geo.properties.NAME ?? getCountryName(geo.id)
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={isSelected ? fill.replace("99", "ee") : fill}
                        stroke={isSelected ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.06)"}
                        strokeWidth={isSelected ? 0.8 : 0.4}
                        style={{
                          default: { outline: "none", cursor: "pointer" },
                          hover: {
                            fill: fill.replace("99", "cc"),
                            stroke: "rgba(255,255,255,0.3)",
                            strokeWidth: 0.6,
                            outline: "none",
                            cursor: "pointer",
                          },
                          pressed: { outline: "none" },
                        }}
                        onMouseEnter={(evt: React.MouseEvent) =>
                          handleMouseEnter({ id: geo.id, properties: { NAME: name } }, evt)
                        }
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleClick({ id: geo.id })}
                        aria-label={name}
                      />
                    )
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
          <p className="absolute bottom-2 right-3 text-[10px] text-[var(--text-muted)]">
            Scroll or pinch to zoom &middot; Click a country for details
          </p>
        </div>

        {/* Detail panel */}
        <div className="w-full lg:w-64 lg:flex-shrink-0">
          {selectedCountry ? (
            <CountryPanel
              isoNumeric={selectedCountry}
              year={year}
              onClose={() => setSelectedCountry(null)}
            />
          ) : (
            <div className="panel flex h-full min-h-[120px] items-center justify-center p-5">
              <p className="text-center text-sm text-[var(--text-muted)]">
                Click any country to see its genre breakdown
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <Legend />

      {/* Tooltip (portal-like fixed positioning) */}
      <Tooltip state={tooltip} year={year} />
    </div>
  )
}

export const WorldGenreMap = memo(WorldGenreMapInner)
