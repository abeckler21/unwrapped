import type { BubbleScoreResult, ScoreBreakdownItem } from '@/lib/analysis/bubble-score'
import type { SpotifyProfile } from '@/lib/types/spotify'

// ── Artist overlap ────────────────────────────────────────────────────────────

export type ArtistOverlapResult = {
  shared: Array<{ id: string; name: string }>
  onlyA: Array<{ id: string; name: string }>
  onlyB: Array<{ id: string; name: string }>
  overlapPercent: number  // shared / union, 0–100
}

export function computeArtistOverlap(
  profileA: SpotifyProfile,
  profileB: SpotifyProfile,
): ArtistOverlapResult {
  const artistsA = profileA.timeRanges.medium_term.topArtists.slice(0, 20)
  const artistsB = profileB.timeRanges.medium_term.topArtists.slice(0, 20)

  const idsB = new Set(artistsB.map(a => a.id))
  const idsA = new Set(artistsA.map(a => a.id))

  const shared = artistsA
    .filter(a => idsB.has(a.id))
    .map(a => ({ id: a.id, name: a.name }))

  const onlyA = artistsA
    .filter(a => !idsB.has(a.id))
    .map(a => ({ id: a.id, name: a.name }))

  const onlyB = artistsB
    .filter(b => !idsA.has(b.id))
    .map(b => ({ id: b.id, name: b.name }))

  const union = new Set([...artistsA.map(a => a.id), ...artistsB.map(b => b.id)])
  const overlapPercent = union.size > 0
    ? Math.round((shared.length / union.size) * 100)
    : 0

  return { shared, onlyA, onlyB, overlapPercent }
}

// ── Genre overlap ─────────────────────────────────────────────────────────────

export type GenreOverlapResult = {
  shared: string[]
  onlyA: string[]
  onlyB: string[]
}

export function computeGenreOverlap(
  scoreA: BubbleScoreResult,
  scoreB: BubbleScoreResult,
): GenreOverlapResult {
  const genresA = new Set(scoreA.genreDistribution.slice(0, 8).map(g => g.genre))
  const genresB = new Set(scoreB.genreDistribution.slice(0, 8).map(g => g.genre))

  const shared = [...genresA].filter(g => genresB.has(g))
  const onlyA  = [...genresA].filter(g => !genresB.has(g))
  const onlyB  = [...genresB].filter(g => !genresA.has(g))

  return { shared, onlyA, onlyB }
}

// ── Divergence score ──────────────────────────────────────────────────────────

/**
 * How musically different are these two listeners?
 * 0 = identical profiles, 100 = polar opposites.
 * Computed as the average absolute difference across all 4 sub-scores.
 */
export function computeDivergenceScore(
  scoreA: BubbleScoreResult,
  scoreB: BubbleScoreResult,
): number {
  const keys: ScoreBreakdownItem['key'][] = [
    'genreConcentration',
    'artistRepetition',
    'temporalConsistency',
  ]

  const diffs = keys.map(key => {
    const a = scoreA.breakdown.find(b => b.key === key)?.score ?? 50
    const b = scoreB.breakdown.find(b => b.key === key)?.score ?? 50
    return Math.abs(a - b)
  })

  return Math.round(diffs.reduce((sum, d) => sum + d, 0) / diffs.length)
}

// ── Verdict ───────────────────────────────────────────────────────────────────

export type CompareVerdict = {
  /** Which user is more algorithmically captured (or 'tie') */
  moreCaptured: 'a' | 'b' | 'tie'
  /** Plain-English summary of the relationship */
  summary: string
}

export function buildVerdict(
  nameA: string,
  nameB: string,
  scoreA: BubbleScoreResult,
  scoreB: BubbleScoreResult,
  divergence: number,
): CompareVerdict {
  const diff = scoreA.score - scoreB.score
  const moreCaptured = Math.abs(diff) < 3 ? 'tie' : diff > 0 ? 'a' : 'b'

  const capturedName = moreCaptured === 'a' ? nameA : moreCaptured === 'b' ? nameB : null

  let summary: string
  if (moreCaptured === 'tie') {
    summary = `${nameA} and ${nameB} are equally deep in their respective loops — within 3 points of each other.`
  } else if (divergence >= 40) {
    summary = `${capturedName} is significantly more algorithmically captured. These are very different listening profiles.`
  } else if (divergence >= 20) {
    summary = `${capturedName} skews more algorithmic, but the two profiles have meaningful overlap.`
  } else {
    summary = `${capturedName} scores slightly higher, but these listeners are more similar than different.`
  }

  return { moreCaptured, summary }
}
