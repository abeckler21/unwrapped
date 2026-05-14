/**
 * Industry Manipulation Index (IMI)
 *
 * Per-track score measuring how algorithmically optimized a song is for the
 * streaming era. Computed entirely from existing Spotify metadata — no audio
 * preview pipeline or deprecated endpoints required.
 *
 * Components (max 100):
 *   Duration alignment  0–30  closeness to the 3:00 streaming sweet spot
 *   Popularity          0–25  raw Spotify popularity as an algorithmic-surfacing proxy
 *   Collaboration       0–20  features/collabs are a documented industry tactic
 *   Recency             0–15  new releases receive algorithmic push
 *   Era deviation       0–10  how much shorter than the era's Billboard average
 */

import { songLengthTrend } from "@/lib/data/macro-trends"
import type { SpotifyTrack } from "@/lib/types/spotify"

// ── Types ─────────────────────────────────────────────────────────────────────

export type IMITier = "Organic" | "Adapted" | "Optimized" | "Engineered"

export type IMIBreakdown = {
  /** Closeness to 3:00 sweet spot (0–30) */
  duration: number
  /** Popularity as algorithmic-surfacing signal (0–25) */
  popularity: number
  /** Feature/collab presence (0–20) */
  collaboration: number
  /** Release recency bonus (0–15) */
  recency: number
  /** Shortness vs. era average (0–10) */
  eraDeviation: number
}

export type IMIResult = {
  score: number
  tier: IMITier
  breakdown: IMIBreakdown
}

export type IMIAggregate = {
  mean: number
  engineeredCount: number
  totalTracks: number
  engineeredPercent: number
}

// ── Constants ─────────────────────────────────────────────────────────────────

/** Tracks at or above this threshold are classified as "algorithmically engineered". */
export const IMI_ENGINEERED_THRESHOLD = 65

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Linearly interpolate the Billboard average song length (in minutes) for a given year. */
function getEraAverageDurationMin(releaseYear: number): number {
  const data = songLengthTrend // ascending by year
  if (releaseYear <= data[0].year) return data[0].avgDurationMinutes
  if (releaseYear >= data[data.length - 1].year) return data[data.length - 1].avgDurationMinutes

  let lower = data[0]
  let upper = data[data.length - 1]
  for (let i = 0; i < data.length - 1; i++) {
    if (data[i].year <= releaseYear && data[i + 1].year > releaseYear) {
      lower = data[i]
      upper = data[i + 1]
      break
    }
  }

  const t = (releaseYear - lower.year) / (upper.year - lower.year)
  return lower.avgDurationMinutes + t * (upper.avgDurationMinutes - lower.avgDurationMinutes)
}

function getIMITier(score: number): IMITier {
  if (score < 31) return "Organic"
  if (score < 56) return "Adapted"
  if (score < 76) return "Optimized"
  return "Engineered"
}

// ── Core computation ──────────────────────────────────────────────────────────

export function computeTrackIMI(track: SpotifyTrack): IMIResult {
  const durationMin = track.durationMs / 60_000
  const releaseYear =
    parseInt(track.album.releaseDate.slice(0, 4), 10) || new Date().getFullYear()

  // 1. Duration alignment: score peaks at 3:00, decays at ~22 pts/min of deviation
  const durationDeviation = Math.abs(durationMin - 3.0)
  const duration = Math.round(Math.max(0, 30 - durationDeviation * 22))

  // 2. Popularity: linear mapping 0–100 → 0–25
  const popularity = Math.round((track.popularity / 100) * 25)

  // 3. Collaboration: solo = 0, one feature = 12, two or more = 20
  const collaboration =
    track.artists.length === 1 ? 0 : track.artists.length === 2 ? 12 : 20

  // 4. Recency: new releases get algorithmic push for ~2 years
  const currentYear = new Date().getFullYear()
  const age = currentYear - releaseYear
  const recency = age <= 0 ? 15 : age <= 2 ? 8 : 0

  // 5. Era deviation: reward being shorter than the era's Billboard average
  const eraAvgMin = getEraAverageDurationMin(releaseYear)
  const shortness = Math.max(0, eraAvgMin - durationMin)
  const eraDeviation = Math.min(10, Math.round(shortness * 12))

  const score = Math.min(100, duration + popularity + collaboration + recency + eraDeviation)

  return {
    score,
    tier: getIMITier(score),
    breakdown: { duration, popularity, collaboration, recency, eraDeviation },
  }
}

export function computeIMIAggregate(tracks: SpotifyTrack[]): IMIAggregate {
  if (!tracks.length) {
    return { mean: 0, engineeredCount: 0, totalTracks: 0, engineeredPercent: 0 }
  }

  const scores = tracks.map((t) => computeTrackIMI(t).score)
  const mean = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
  const engineeredCount = scores.filter((s) => s >= IMI_ENGINEERED_THRESHOLD).length
  const engineeredPercent = Math.round((engineeredCount / tracks.length) * 100)

  return { mean, engineeredCount, totalTracks: tracks.length, engineeredPercent }
}

// ── Presentation helpers ──────────────────────────────────────────────────────

export function imiTierColor(tier: IMITier): string {
  switch (tier) {
    case "Organic":
      return "text-[var(--accent-cool)]"
    case "Adapted":
      return "text-yellow-400"
    case "Optimized":
      return "text-[var(--accent)]"
    case "Engineered":
      return "text-red-400"
  }
}

export function imiTierBg(tier: IMITier): string {
  switch (tier) {
    case "Organic":
      return "bg-sky-400/10 text-sky-300 border-sky-400/20"
    case "Adapted":
      return "bg-yellow-400/10 text-yellow-300 border-yellow-400/20"
    case "Optimized":
      return "bg-orange-500/10 text-orange-400 border-orange-500/20"
    case "Engineered":
      return "bg-red-500/10 text-red-400 border-red-500/20"
  }
}
