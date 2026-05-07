import type { SpotifyProfile, TimeRange } from "@/lib/types/spotify";

export type ListeningProfile = {
  brevity: number;            // 0–1, higher = shorter songs = more algorithmic
  recency: number;            // 0–1, higher = more new releases = more algorithmic
  genreConcentration: number; // 0–1, higher = narrower genre range = more algorithmic
  artistConcentration: number; // 0–1, higher = more dominated by few artists = more algorithmic
  trackCount: number;
};

export type ListeningProfileWithRaw = ListeningProfile & {
  meanDurationMs: number;
  recentPercent: number;
  genreHHI: number;
  topThreeArtistWeightPercent: number;
};

// The reference profile representing algorithmically optimized listening.
export const ALGORITHMIC_ARCHETYPE: Omit<ListeningProfile, "trackCount"> = {
  brevity: 1.0,
  recency: 0.85,
  genreConcentration: 0.80,
  artistConcentration: 0.75,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getRankWeight(index: number, total: number): number {
  return (total - index) / total;
}

export function computeListeningProfile(
  profile: SpotifyProfile,
  timeRange: TimeRange,
): ListeningProfileWithRaw {
  const { topTracks, topArtists } = profile.timeRanges[timeRange];

  // ── brevity ──────────────────────────────────────────────────────────────
  // 3:00 (180 000 ms) = 1.0; 5:00 (300 000 ms) or longer = 0.0
  const meanDurationMs =
    topTracks.length > 0
      ? topTracks.reduce((sum, t) => sum + t.durationMs, 0) / topTracks.length
      : 210_000;
  const brevity = clamp(1 - (meanDurationMs - 180_000) / 120_000, 0, 1);

  // ── recency ───────────────────────────────────────────────────────────────
  // Fraction of top tracks released in the last 2 years
  const currentYear = new Date().getFullYear();
  const recentCount = topTracks.filter(
    (t) => parseInt(t.album.releaseDate.slice(0, 4), 10) >= currentYear - 2,
  ).length;
  const recency = clamp(recentCount / Math.max(topTracks.length, 1), 0, 1);
  const recentPercent = Math.round(recency * 100);

  // ── genreConcentration ────────────────────────────────────────────────────
  // HHI on rank-weighted genre distribution (same weights as bubble-score.ts)
  const genreWeights = new Map<string, number>();
  const totalArtists = topArtists.length || 1;

  for (let i = 0; i < topArtists.length; i++) {
    const artist = topArtists[i];
    const weight = getRankWeight(i, totalArtists);
    const genres = artist.genres?.filter(Boolean) ?? [];
    if (!genres.length) continue;
    for (const genre of genres) {
      genreWeights.set(genre, (genreWeights.get(genre) ?? 0) + weight / genres.length);
    }
  }

  let genreConcentration: number;
  let genreHHI: number;
  if (genreWeights.size > 0) {
    const totalGenreWeight = [...genreWeights.values()].reduce((s, v) => s + v, 0) || 1;
    genreHHI = [...genreWeights.values()].reduce(
      (s, v) => s + (v / totalGenreWeight) ** 2,
      0,
    );
    genreConcentration = clamp(genreHHI, 0, 1);
  } else {
    genreHHI = 0;
    genreConcentration = 0.5; // neutral when no genre data
  }

  // ── artistConcentration ───────────────────────────────────────────────────
  // Fraction of total rank weight captured by the top 3 artists
  const weights = topArtists.map((_, i) => getRankWeight(i, totalArtists));
  const totalWeight = weights.reduce((s, v) => s + v, 0) || 1;
  const topThreeWeight = weights.slice(0, 3).reduce((s, v) => s + v, 0);
  const artistConcentration = clamp(topThreeWeight / totalWeight, 0, 1);
  const topThreeArtistWeightPercent = Math.round(artistConcentration * 100);

  return {
    brevity,
    recency,
    genreConcentration,
    artistConcentration,
    trackCount: topTracks.length,
    meanDurationMs: Math.round(meanDurationMs),
    recentPercent,
    genreHHI: Math.round(genreHHI * 100) / 100,
    topThreeArtistWeightPercent,
  };
}
