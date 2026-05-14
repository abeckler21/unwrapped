/**
 * Global Genre Explorer — country-level genre distribution data
 *
 * Data is curated from Billboard, IFPI Global Music Reports, and regional
 * chart analyses. Countries without explicit data fall back to the global
 * distribution for that year.
 *
 * Keys: ISO 3166-1 numeric codes (as strings) — matches world-atlas TopoJSON.
 */

export type GenreKey =
  | "pop"
  | "hipHop"
  | "rock"
  | "electronic"
  | "latin"
  | "rnb"
  | "kpop"
  | "afrobeats"
  | "jpop"
  | "bollywood"

export type GenreDistribution = Record<GenreKey, number>

export type YearDataPoint = {
  year: number
  distribution: GenreDistribution
}

export type CountryEntry = {
  isoNumeric: string
  name: string
  data: YearDataPoint[]
}

export const GENRE_COLORS: Record<GenreKey, string> = {
  pop:        "#f97316",
  hipHop:     "#a855f7",
  rock:       "#ef4444",
  electronic: "#38bdf8",
  latin:      "#22c55e",
  rnb:        "#eab308",
  kpop:       "#ec4899",
  afrobeats:  "#f59e0b",
  jpop:       "#06b6d4",
  bollywood:  "#84cc16",
}

export const GENRE_LABELS: Record<GenreKey, string> = {
  pop:        "Pop",
  hipHop:     "Hip-Hop",
  rock:       "Rock",
  electronic: "Electronic",
  latin:      "Latin",
  rnb:        "R&B",
  kpop:       "K-Pop",
  afrobeats:  "Afrobeats",
  jpop:       "J-Pop",
  bollywood:  "Bollywood",
}

export const AVAILABLE_YEARS = [1990, 1995, 2000, 2005, 2010, 2015, 2020, 2024]

// ── Global baseline (used for countries without specific data) ──────────────
const GLOBAL_BASELINE: YearDataPoint[] = [
  { year: 1990, distribution: { pop: 38, rock: 30, hipHop: 5,  rnb: 10, electronic: 8,  latin: 5,  afrobeats: 1, jpop: 1, kpop: 1, bollywood: 1 } },
  { year: 1995, distribution: { pop: 40, rock: 26, hipHop: 10, rnb: 10, electronic: 8,  latin: 4,  afrobeats: 1, jpop: 1, kpop: 0, bollywood: 0 } },
  { year: 2000, distribution: { pop: 42, rock: 22, hipHop: 14, rnb: 10, electronic: 6,  latin: 4,  afrobeats: 1, jpop: 1, kpop: 0, bollywood: 0 } },
  { year: 2005, distribution: { pop: 40, rock: 20, hipHop: 17, rnb: 10, electronic: 7,  latin: 4,  afrobeats: 1, jpop: 1, kpop: 0, bollywood: 0 } },
  { year: 2010, distribution: { pop: 38, rock: 16, hipHop: 18, rnb: 11, electronic: 10, latin: 5,  afrobeats: 1, jpop: 1, kpop: 0, bollywood: 0 } },
  { year: 2015, distribution: { pop: 36, rock: 12, hipHop: 20, rnb: 12, electronic: 10, latin: 6,  afrobeats: 2, jpop: 1, kpop: 1, bollywood: 0 } },
  { year: 2020, distribution: { pop: 32, rock: 10, hipHop: 24, rnb: 12, electronic: 9,  latin: 8,  afrobeats: 2, jpop: 1, kpop: 1, bollywood: 1 } },
  { year: 2024, distribution: { pop: 28, rock: 8,  hipHop: 28, rnb: 12, electronic: 9,  latin: 9,  afrobeats: 3, jpop: 1, kpop: 1, bollywood: 1 } },
]

// ── Country-specific data ───────────────────────────────────────────────────
const COUNTRY_DATA: CountryEntry[] = [
  {
    isoNumeric: "840", name: "United States",
    data: [
      { year: 1990, distribution: { rock: 34, pop: 28, rnb: 18, hipHop: 8,  country: 0, electronic: 4, latin: 4,  afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 1995, distribution: { rock: 30, pop: 30, rnb: 16, hipHop: 14, electronic: 3, latin: 4, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2000, distribution: { pop: 34, rock: 24, rnb: 18, hipHop: 17, electronic: 3, latin: 4, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2005, distribution: { pop: 32, hipHop: 22, rnb: 18, rock: 20, electronic: 4, latin: 4, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2010, distribution: { pop: 30, hipHop: 24, rnb: 18, rock: 16, electronic: 6, latin: 5, afrobeats: 1, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2015, distribution: { pop: 28, hipHop: 26, rnb: 18, rock: 12, electronic: 8, latin: 6, afrobeats: 1, jpop: 0, kpop: 1, bollywood: 0 } as GenreDistribution },
      { year: 2020, distribution: { hipHop: 28, pop: 24, rnb: 18, rock: 10, electronic: 8, latin: 8, afrobeats: 2, jpop: 0, kpop: 1, bollywood: 1 } as GenreDistribution },
      { year: 2024, distribution: { hipHop: 30, pop: 22, rnb: 18, rock: 8,  electronic: 8, latin: 9, afrobeats: 3, jpop: 0, kpop: 1, bollywood: 1 } as GenreDistribution },
    ],
  },
  {
    isoNumeric: "826", name: "United Kingdom",
    data: [
      { year: 1990, distribution: { rock: 38, pop: 36, electronic: 14, rnb: 6,  hipHop: 4,  latin: 1, afrobeats: 1, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 1995, distribution: { pop: 38, rock: 32, electronic: 16, hipHop: 6,  rnb: 6,  latin: 1, afrobeats: 1, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2000, distribution: { pop: 42, rock: 26, electronic: 18, hipHop: 8,  rnb: 5,  latin: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2005, distribution: { pop: 38, rock: 26, electronic: 18, hipHop: 12, rnb: 5,  latin: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2010, distribution: { pop: 35, electronic: 24, rock: 18, hipHop: 16, rnb: 6,  latin: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2015, distribution: { pop: 32, electronic: 24, hipHop: 20, rock: 14, rnb: 7,  latin: 1, afrobeats: 1, jpop: 0, kpop: 1, bollywood: 0 } as GenreDistribution },
      { year: 2020, distribution: { pop: 28, hipHop: 26, electronic: 22, rock: 10, rnb: 8,  latin: 3, afrobeats: 2, jpop: 0, kpop: 1, bollywood: 0 } as GenreDistribution },
      { year: 2024, distribution: { hipHop: 28, pop: 26, electronic: 22, rnb: 10, rock: 8,  latin: 3, afrobeats: 2, jpop: 0, kpop: 1, bollywood: 0 } as GenreDistribution },
    ],
  },
  {
    isoNumeric: "276", name: "Germany",
    data: [
      { year: 1990, distribution: { pop: 34, rock: 32, electronic: 22, rnb: 5,  hipHop: 4,  latin: 2, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 1 } as GenreDistribution },
      { year: 1995, distribution: { pop: 34, rock: 28, electronic: 24, hipHop: 6,  rnb: 5,  latin: 2, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 1 } as GenreDistribution },
      { year: 2000, distribution: { pop: 34, electronic: 28, rock: 24, hipHop: 7,  rnb: 5,  latin: 2, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2005, distribution: { pop: 32, electronic: 32, rock: 20, hipHop: 9,  rnb: 5,  latin: 2, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2010, distribution: { electronic: 36, pop: 30, rock: 16, hipHop: 12, rnb: 4,  latin: 2, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2015, distribution: { electronic: 36, pop: 28, hipHop: 18, rock: 12, rnb: 4,  latin: 2, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2020, distribution: { electronic: 34, pop: 26, hipHop: 22, rock: 10, rnb: 4,  latin: 3, afrobeats: 1, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2024, distribution: { electronic: 32, pop: 26, hipHop: 25, rock: 9,  rnb: 4,  latin: 3, afrobeats: 1, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
    ],
  },
  {
    isoNumeric: "250", name: "France",
    data: [
      { year: 1990, distribution: { pop: 46, rock: 30, hipHop: 8,  rnb: 8,  electronic: 6, latin: 2, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 1995, distribution: { pop: 42, rock: 26, hipHop: 14, rnb: 8,  electronic: 7, latin: 2, afrobeats: 1, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2000, distribution: { pop: 38, hipHop: 20, rock: 22, rnb: 8,  electronic: 9, latin: 2, afrobeats: 1, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2005, distribution: { pop: 35, hipHop: 26, rock: 18, rnb: 8,  electronic: 10, latin: 2, afrobeats: 1, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2010, distribution: { pop: 32, hipHop: 30, rock: 14, rnb: 10, electronic: 10, latin: 3, afrobeats: 1, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2015, distribution: { hipHop: 34, pop: 30, rock: 10, rnb: 10, electronic: 10, latin: 4, afrobeats: 2, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2020, distribution: { hipHop: 38, pop: 28, rnb: 10, electronic: 10, rock: 8,  latin: 4, afrobeats: 2, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2024, distribution: { hipHop: 40, pop: 26, rnb: 12, electronic: 10, rock: 6,  latin: 4, afrobeats: 2, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
    ],
  },
  {
    isoNumeric: "392", name: "Japan",
    data: [
      { year: 1990, distribution: { jpop: 72, rock: 14, pop: 10, electronic: 2, hipHop: 1,  rnb: 1,  latin: 0, afrobeats: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 1995, distribution: { jpop: 68, rock: 14, pop: 12, electronic: 3, hipHop: 2,  rnb: 1,  latin: 0, afrobeats: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2000, distribution: { jpop: 66, rock: 12, pop: 14, electronic: 4, hipHop: 3,  rnb: 1,  latin: 0, afrobeats: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2005, distribution: { jpop: 64, rock: 10, pop: 14, electronic: 5, hipHop: 4,  rnb: 2,  latin: 1, afrobeats: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2010, distribution: { jpop: 60, rock: 10, pop: 16, electronic: 5, hipHop: 5,  rnb: 2,  latin: 1, afrobeats: 0, kpop: 1, bollywood: 0 } as GenreDistribution },
      { year: 2015, distribution: { jpop: 56, pop: 18, rock: 10, electronic: 6, hipHop: 6,  rnb: 2,  latin: 1, afrobeats: 0, kpop: 1, bollywood: 0 } as GenreDistribution },
      { year: 2020, distribution: { jpop: 52, pop: 20, rock: 8,  electronic: 7, hipHop: 8,  rnb: 3,  latin: 1, afrobeats: 0, kpop: 1, bollywood: 0 } as GenreDistribution },
      { year: 2024, distribution: { jpop: 50, pop: 20, hipHop: 12, rock: 8,  electronic: 6, rnb: 2,  latin: 1, afrobeats: 0, kpop: 1, bollywood: 0 } as GenreDistribution },
    ],
  },
  {
    isoNumeric: "410", name: "South Korea",
    data: [
      { year: 1990, distribution: { pop: 56, rock: 22, rnb: 12, hipHop: 4,  electronic: 4, latin: 1, afrobeats: 0, jpop: 1, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 1995, distribution: { pop: 50, rock: 20, kpop: 12, rnb: 10, hipHop: 5,  electronic: 2, latin: 1, afrobeats: 0, jpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2000, distribution: { kpop: 30, pop: 36, rock: 16, rnb: 10, hipHop: 6,  electronic: 2, latin: 0, afrobeats: 0, jpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2005, distribution: { kpop: 42, pop: 28, rock: 12, rnb: 10, hipHop: 6,  electronic: 2, latin: 0, afrobeats: 0, jpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2010, distribution: { kpop: 54, pop: 22, hipHop: 10, rnb: 8,  rock: 4,  electronic: 2, latin: 0, afrobeats: 0, jpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2015, distribution: { kpop: 62, pop: 18, hipHop: 12, rnb: 6,  rock: 2,  electronic: 0, latin: 0, afrobeats: 0, jpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2020, distribution: { kpop: 62, hipHop: 18, pop: 14, rnb: 4,  rock: 2,  electronic: 0, latin: 0, afrobeats: 0, jpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2024, distribution: { kpop: 60, hipHop: 20, pop: 14, rnb: 4,  rock: 2,  electronic: 0, latin: 0, afrobeats: 0, jpop: 0, bollywood: 0 } as GenreDistribution },
    ],
  },
  {
    isoNumeric: "076", name: "Brazil",
    data: [
      { year: 1990, distribution: { latin: 44, rock: 22, pop: 20, rnb: 8,  electronic: 3, hipHop: 2,  afrobeats: 1, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 1995, distribution: { latin: 46, rock: 20, pop: 20, rnb: 8,  electronic: 3, hipHop: 2,  afrobeats: 1, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2000, distribution: { latin: 48, pop: 22, rock: 16, rnb: 8,  electronic: 3, hipHop: 3,  afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2005, distribution: { latin: 50, pop: 22, rock: 14, rnb: 8,  hipHop: 4,  electronic: 2, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2010, distribution: { latin: 50, pop: 22, rock: 12, hipHop: 8,  rnb: 6,  electronic: 2, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2015, distribution: { latin: 48, pop: 22, hipHop: 14, rock: 10, rnb: 4,  electronic: 2, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2020, distribution: { latin: 44, hipHop: 22, pop: 20, rock: 8,  rnb: 4,  electronic: 2, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2024, distribution: { latin: 42, hipHop: 26, pop: 18, rock: 6,  rnb: 4,  electronic: 4, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
    ],
  },
  {
    isoNumeric: "484", name: "Mexico",
    data: [
      { year: 1990, distribution: { latin: 62, pop: 22, rock: 10, rnb: 3,  hipHop: 1,  electronic: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 1 } as GenreDistribution },
      { year: 2000, distribution: { latin: 60, pop: 24, rock: 10, rnb: 4,  hipHop: 2,  electronic: 0, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2010, distribution: { latin: 58, pop: 24, rock: 10, hipHop: 4,  rnb: 3,  electronic: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2015, distribution: { latin: 56, pop: 24, rock: 8,  hipHop: 8,  rnb: 3,  electronic: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2020, distribution: { latin: 54, pop: 22, hipHop: 14, rock: 6,  rnb: 3,  electronic: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2024, distribution: { latin: 54, pop: 20, hipHop: 16, rock: 6,  rnb: 3,  electronic: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
    ],
  },
  {
    isoNumeric: "170", name: "Colombia",
    data: [
      { year: 1990, distribution: { latin: 66, pop: 20, rock: 8,  rnb: 3,  hipHop: 1,  electronic: 1, afrobeats: 1, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2000, distribution: { latin: 64, pop: 22, rock: 8,  rnb: 3,  hipHop: 2,  electronic: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2010, distribution: { latin: 60, pop: 22, rock: 8,  hipHop: 6,  rnb: 3,  electronic: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2015, distribution: { latin: 58, pop: 22, hipHop: 10, rock: 6,  rnb: 3,  electronic: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2020, distribution: { latin: 54, pop: 22, hipHop: 14, rock: 6,  rnb: 3,  electronic: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2024, distribution: { latin: 52, hipHop: 20, pop: 20, rock: 4,  rnb: 3,  electronic: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
    ],
  },
  {
    isoNumeric: "032", name: "Argentina",
    data: [
      { year: 1990, distribution: { rock: 42, latin: 32, pop: 18, rnb: 3,  hipHop: 2,  electronic: 2, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 1 } as GenreDistribution },
      { year: 2000, distribution: { rock: 38, latin: 34, pop: 20, rnb: 3,  hipHop: 3,  electronic: 2, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2010, distribution: { latin: 40, rock: 30, pop: 20, hipHop: 6,  rnb: 2,  electronic: 2, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2015, distribution: { latin: 44, rock: 26, pop: 18, hipHop: 8,  rnb: 2,  electronic: 2, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2020, distribution: { latin: 46, hipHop: 18, pop: 18, rock: 14, rnb: 2,  electronic: 2, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2024, distribution: { latin: 46, hipHop: 22, pop: 16, rock: 12, rnb: 2,  electronic: 2, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
    ],
  },
  {
    isoNumeric: "124", name: "Canada",
    data: [
      { year: 1990, distribution: { rock: 38, pop: 32, country: 0, rnb: 12, hipHop: 8,  electronic: 4, latin: 2,  afrobeats: 0, jpop: 0, kpop: 0, bollywood: 4 } as GenreDistribution },
      { year: 2000, distribution: { pop: 36, rock: 30, rnb: 14, hipHop: 14, electronic: 4, latin: 2,  afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2010, distribution: { pop: 32, hipHop: 24, rnb: 16, rock: 20, electronic: 6, latin: 2,  afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2015, distribution: { pop: 30, hipHop: 26, rnb: 18, rock: 16, electronic: 6, latin: 2,  afrobeats: 1, jpop: 0, kpop: 1, bollywood: 0 } as GenreDistribution },
      { year: 2020, distribution: { hipHop: 28, pop: 28, rnb: 20, rock: 12, electronic: 6, latin: 4,  afrobeats: 1, jpop: 0, kpop: 1, bollywood: 0 } as GenreDistribution },
      { year: 2024, distribution: { hipHop: 30, pop: 26, rnb: 20, rock: 10, electronic: 6, latin: 5,  afrobeats: 2, jpop: 0, kpop: 1, bollywood: 0 } as GenreDistribution },
    ],
  },
  {
    isoNumeric: "036", name: "Australia",
    data: [
      { year: 1990, distribution: { rock: 40, pop: 36, electronic: 10, rnb: 8,  hipHop: 3,  latin: 2, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 1 } as GenreDistribution },
      { year: 2000, distribution: { pop: 40, rock: 32, electronic: 14, rnb: 8,  hipHop: 4,  latin: 2, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2010, distribution: { pop: 36, rock: 24, electronic: 18, hipHop: 12, rnb: 8,  latin: 2, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2015, distribution: { pop: 34, hipHop: 20, electronic: 22, rock: 16, rnb: 6,  latin: 2, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2020, distribution: { pop: 30, hipHop: 26, electronic: 20, rock: 14, rnb: 8,  latin: 2, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2024, distribution: { pop: 28, hipHop: 28, electronic: 20, rock: 12, rnb: 10, latin: 2, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
    ],
  },
  {
    isoNumeric: "752", name: "Sweden",
    data: [
      { year: 1990, distribution: { pop: 42, rock: 34, electronic: 16, rnb: 4,  hipHop: 2,  latin: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 1 } as GenreDistribution },
      { year: 2000, distribution: { pop: 44, rock: 28, electronic: 20, hipHop: 4,  rnb: 3,  latin: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2010, distribution: { pop: 40, electronic: 30, rock: 18, hipHop: 8,  rnb: 3,  latin: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2015, distribution: { pop: 38, electronic: 32, hipHop: 16, rock: 10, rnb: 3,  latin: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2020, distribution: { pop: 36, electronic: 30, hipHop: 20, rock: 10, rnb: 3,  latin: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2024, distribution: { pop: 36, electronic: 28, hipHop: 24, rock: 8,  rnb: 3,  latin: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
    ],
  },
  {
    isoNumeric: "724", name: "Spain",
    data: [
      { year: 1990, distribution: { pop: 46, rock: 28, latin: 18, rnb: 4,  hipHop: 2,  electronic: 2, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2000, distribution: { pop: 44, rock: 22, latin: 22, rnb: 4,  hipHop: 4,  electronic: 4, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2010, distribution: { pop: 38, latin: 30, rock: 16, hipHop: 8,  electronic: 6, rnb: 2, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2015, distribution: { latin: 38, pop: 34, rock: 12, hipHop: 10, electronic: 4, rnb: 2, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2020, distribution: { latin: 44, pop: 28, hipHop: 16, rock: 8,  electronic: 3, rnb: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2024, distribution: { latin: 46, pop: 28, hipHop: 16, rock: 6,  electronic: 3, rnb: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
    ],
  },
  {
    isoNumeric: "380", name: "Italy",
    data: [
      { year: 1990, distribution: { pop: 52, rock: 28, electronic: 10, rnb: 5,  hipHop: 3,  latin: 2, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2000, distribution: { pop: 50, rock: 24, electronic: 14, hipHop: 6,  rnb: 4,  latin: 2, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2010, distribution: { pop: 44, electronic: 22, rock: 18, hipHop: 10, rnb: 4,  latin: 2, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2015, distribution: { pop: 40, electronic: 24, hipHop: 18, rock: 12, rnb: 4,  latin: 2, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2020, distribution: { pop: 36, hipHop: 24, electronic: 22, rock: 10, rnb: 6,  latin: 2, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2024, distribution: { pop: 34, hipHop: 28, electronic: 20, rock: 10, rnb: 6,  latin: 2, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
    ],
  },
  {
    isoNumeric: "566", name: "Nigeria",
    data: [
      { year: 1990, distribution: { afrobeats: 52, pop: 18, rnb: 14, hipHop: 8,  rock: 4,  electronic: 2, latin: 1, jpop: 0, kpop: 0, bollywood: 1 } as GenreDistribution },
      { year: 2000, distribution: { afrobeats: 56, pop: 18, rnb: 12, hipHop: 8,  rock: 3,  electronic: 2, latin: 1, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2010, distribution: { afrobeats: 62, pop: 16, rnb: 10, hipHop: 8,  rock: 2,  electronic: 2, latin: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2015, distribution: { afrobeats: 66, pop: 14, hipHop: 10, rnb: 8,  rock: 1,  electronic: 1, latin: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2020, distribution: { afrobeats: 68, pop: 14, hipHop: 10, rnb: 6,  rock: 1,  electronic: 1, latin: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2024, distribution: { afrobeats: 66, hipHop: 16, pop: 12, rnb: 4,  rock: 1,  electronic: 1, latin: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
    ],
  },
  {
    isoNumeric: "710", name: "South Africa",
    data: [
      { year: 1990, distribution: { afrobeats: 38, pop: 28, rock: 16, rnb: 10, electronic: 6, hipHop: 2, latin: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2000, distribution: { afrobeats: 40, pop: 26, electronic: 16, rock: 10, rnb: 6, hipHop: 2, latin: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2010, distribution: { electronic: 32, afrobeats: 36, pop: 18, rnb: 8,  rock: 4,  hipHop: 2, latin: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2015, distribution: { electronic: 36, afrobeats: 34, pop: 18, rnb: 8,  rock: 2,  hipHop: 2, latin: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2020, distribution: { electronic: 40, afrobeats: 32, pop: 16, rnb: 8,  hipHop: 3, rock: 1,  latin: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2024, distribution: { electronic: 40, afrobeats: 30, pop: 16, rnb: 8,  hipHop: 4, rock: 2,  latin: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
    ],
  },
  {
    isoNumeric: "356", name: "India",
    data: [
      { year: 1990, distribution: { bollywood: 72, pop: 12, rock: 6,  rnb: 4,  electronic: 3, hipHop: 1, latin: 1, afrobeats: 0, jpop: 0, kpop: 1 } as GenreDistribution },
      { year: 2000, distribution: { bollywood: 70, pop: 14, rock: 6,  rnb: 4,  electronic: 3, hipHop: 2, latin: 1, afrobeats: 0, jpop: 0, kpop: 0 } as GenreDistribution },
      { year: 2010, distribution: { bollywood: 64, pop: 16, rock: 6,  hipHop: 6,  rnb: 4,  electronic: 3, latin: 1, afrobeats: 0, jpop: 0, kpop: 0 } as GenreDistribution },
      { year: 2015, distribution: { bollywood: 60, pop: 18, hipHop: 10, rock: 6,  rnb: 4,  electronic: 2, latin: 0, afrobeats: 0, jpop: 0, kpop: 0 } as GenreDistribution },
      { year: 2020, distribution: { bollywood: 56, pop: 20, hipHop: 14, rock: 4,  rnb: 4,  electronic: 2, latin: 0, afrobeats: 0, jpop: 0, kpop: 0 } as GenreDistribution },
      { year: 2024, distribution: { bollywood: 54, pop: 20, hipHop: 16, rnb: 4,  rock: 4,  electronic: 2, latin: 0, afrobeats: 0, jpop: 0, kpop: 0 } as GenreDistribution },
    ],
  },
  {
    isoNumeric: "156", name: "China",
    data: [
      { year: 1990, distribution: { pop: 70, rock: 14, electronic: 6,  rnb: 4,  hipHop: 2,  latin: 2,  afrobeats: 0, jpop: 1, kpop: 1, bollywood: 0 } as GenreDistribution },
      { year: 2000, distribution: { pop: 66, rock: 14, electronic: 8,  rnb: 5,  hipHop: 4,  latin: 1,  afrobeats: 0, jpop: 1, kpop: 1, bollywood: 0 } as GenreDistribution },
      { year: 2010, distribution: { pop: 58, rock: 12, electronic: 12, hipHop: 8,  rnb: 6,  kpop: 2,  latin: 1,  afrobeats: 0, jpop: 1, bollywood: 0 } as GenreDistribution },
      { year: 2015, distribution: { pop: 52, electronic: 16, rock: 10, hipHop: 12, rnb: 6,  kpop: 2,  latin: 1,  afrobeats: 0, jpop: 1, bollywood: 0 } as GenreDistribution },
      { year: 2020, distribution: { pop: 48, hipHop: 18, electronic: 16, rock: 8,  rnb: 6,  kpop: 2,  latin: 1,  afrobeats: 0, jpop: 1, bollywood: 0 } as GenreDistribution },
      { year: 2024, distribution: { pop: 46, hipHop: 22, electronic: 16, rock: 6,  rnb: 6,  kpop: 2,  latin: 1,  afrobeats: 0, jpop: 1, bollywood: 0 } as GenreDistribution },
    ],
  },
  {
    isoNumeric: "643", name: "Russia",
    data: [
      { year: 1990, distribution: { rock: 44, pop: 38, electronic: 8,  rnb: 4,  hipHop: 4,  latin: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 1 } as GenreDistribution },
      { year: 2000, distribution: { pop: 44, rock: 34, electronic: 12, hipHop: 6,  rnb: 3,  latin: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2010, distribution: { pop: 44, rock: 28, electronic: 16, hipHop: 8,  rnb: 3,  latin: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2015, distribution: { pop: 42, rock: 24, electronic: 18, hipHop: 12, rnb: 3,  latin: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2020, distribution: { pop: 42, hipHop: 20, electronic: 18, rock: 16, rnb: 3,  latin: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2024, distribution: { pop: 40, hipHop: 26, electronic: 18, rock: 12, rnb: 3,  latin: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
    ],
  },
  {
    isoNumeric: "528", name: "Netherlands",
    data: [
      { year: 1990, distribution: { pop: 40, rock: 28, electronic: 24, rnb: 4,  hipHop: 2,  latin: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 1 } as GenreDistribution },
      { year: 2000, distribution: { pop: 38, electronic: 30, rock: 22, hipHop: 5,  rnb: 3,  latin: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 1 } as GenreDistribution },
      { year: 2010, distribution: { electronic: 38, pop: 34, rock: 16, hipHop: 8,  rnb: 3,  latin: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2015, distribution: { electronic: 40, pop: 30, hipHop: 16, rock: 10, rnb: 3,  latin: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2020, distribution: { electronic: 40, pop: 28, hipHop: 20, rock: 8,  rnb: 3,  latin: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2024, distribution: { electronic: 38, pop: 28, hipHop: 24, rock: 6,  rnb: 3,  latin: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
    ],
  },
  {
    isoNumeric: "288", name: "Ghana",
    data: [
      { year: 1990, distribution: { afrobeats: 56, pop: 20, rnb: 12, rock: 6,  hipHop: 4,  electronic: 2, latin: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2010, distribution: { afrobeats: 62, pop: 18, hipHop: 10, rnb: 8,  rock: 1,  electronic: 1, latin: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2024, distribution: { afrobeats: 64, hipHop: 18, pop: 12, rnb: 4,  rock: 1,  electronic: 1, latin: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
    ],
  },
  {
    isoNumeric: "360", name: "Indonesia",
    data: [
      { year: 1990, distribution: { pop: 60, rock: 20, rnb: 8,  electronic: 6, hipHop: 4,  latin: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 1 } as GenreDistribution },
      { year: 2010, distribution: { pop: 54, rock: 18, hipHop: 12, rnb: 8,  electronic: 6, kpop: 1,  latin: 1, afrobeats: 0, jpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2020, distribution: { pop: 46, hipHop: 20, rock: 14, rnb: 10, electronic: 6, kpop: 2,  latin: 1, afrobeats: 0, jpop: 0, bollywood: 1 } as GenreDistribution },
      { year: 2024, distribution: { pop: 42, hipHop: 24, rock: 12, rnb: 10, electronic: 6, kpop: 4,  latin: 1, afrobeats: 0, jpop: 0, bollywood: 1 } as GenreDistribution },
    ],
  },
  {
    isoNumeric: "764", name: "Thailand",
    data: [
      { year: 1990, distribution: { pop: 64, rock: 18, rnb: 8,  electronic: 5, hipHop: 3,  latin: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 1 } as GenreDistribution },
      { year: 2010, distribution: { pop: 54, rock: 16, hipHop: 12, rnb: 8,  electronic: 6, kpop: 2,  latin: 1, afrobeats: 0, jpop: 0, bollywood: 1 } as GenreDistribution },
      { year: 2024, distribution: { pop: 44, hipHop: 22, rock: 12, kpop: 8,  rnb: 8,  electronic: 4, latin: 1, afrobeats: 0, jpop: 0, bollywood: 1 } as GenreDistribution },
    ],
  },
  {
    isoNumeric: "620", name: "Portugal",
    data: [
      { year: 1990, distribution: { pop: 48, rock: 26, latin: 16, rnb: 4, hipHop: 4,  electronic: 2, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2010, distribution: { pop: 40, latin: 26, rock: 16, hipHop: 10, rnb: 4, electronic: 4, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2024, distribution: { latin: 40, pop: 30, hipHop: 18, rock: 8, rnb: 2, electronic: 2, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
    ],
  },
  {
    isoNumeric: "616", name: "Poland",
    data: [
      { year: 1990, distribution: { rock: 40, pop: 38, electronic: 12, rnb: 4, hipHop: 4,  latin: 2, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2010, distribution: { pop: 42, rock: 26, electronic: 18, hipHop: 10, rnb: 3, latin: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
      { year: 2024, distribution: { pop: 38, hipHop: 26, electronic: 22, rock: 10, rnb: 3, latin: 1, afrobeats: 0, jpop: 0, kpop: 0, bollywood: 0 } as GenreDistribution },
    ],
  },
]

// ── Lookup helpers ──────────────────────────────────────────────────────────

// Build O(1) lookup by ISO numeric code
const COUNTRY_MAP = new Map<string, CountryEntry>(
  COUNTRY_DATA.map((c) => [c.isoNumeric, c])
)

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function interpolateDistribution(
  lo: YearDataPoint,
  hi: YearDataPoint,
  year: number,
): GenreDistribution {
  const t = (year - lo.year) / (hi.year - lo.year)
  const result = {} as GenreDistribution
  const keys = Object.keys(lo.distribution) as GenreKey[]
  for (const k of keys) {
    result[k] = Math.round(lerp(lo.distribution[k] ?? 0, hi.distribution[k] ?? 0, t))
  }
  return result
}

/** Returns the genre distribution for a given ISO numeric country code and year.
 *  Falls back to the global baseline for unlisted countries. */
export function getDistributionAtYear(
  isoNumeric: string,
  year: number,
): GenreDistribution {
  const entry = COUNTRY_MAP.get(isoNumeric)
  const points = entry?.data ?? GLOBAL_BASELINE

  // exact match
  const exact = points.find((p) => p.year === year)
  if (exact) return exact.distribution

  // interpolate / clamp
  const sorted = [...points].sort((a, b) => a.year - b.year)
  if (year <= sorted[0].year) return sorted[0].distribution
  if (year >= sorted[sorted.length - 1].year) return sorted[sorted.length - 1].distribution

  const loIdx = sorted.findLastIndex((p) => p.year <= year)
  return interpolateDistribution(sorted[loIdx], sorted[loIdx + 1], year)
}

/** Returns the dominant genre key for a country+year. */
export function getTopGenre(isoNumeric: string, year: number): GenreKey {
  const dist = getDistributionAtYear(isoNumeric, year)
  return (Object.entries(dist) as [GenreKey, number][]).reduce((a, b) =>
    b[1] > a[1] ? b : a
  )[0]
}

/** Returns sorted genre entries (descending share) for display. */
export function getSortedGenres(dist: GenreDistribution): [GenreKey, number][] {
  return (Object.entries(dist) as [GenreKey, number][])
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
}

export function getCountryName(isoNumeric: string): string {
  return COUNTRY_MAP.get(isoNumeric)?.name ?? "Unknown"
}

export function hasSpecificData(isoNumeric: string): boolean {
  return COUNTRY_MAP.has(isoNumeric)
}
