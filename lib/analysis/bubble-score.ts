import { SpotifyArtist, SpotifyProfile, SpotifyTrack, TimeRange } from "@/lib/types/spotify";

type ScoreTier =
  | "Wide Open"
  | "Narrowing"
  | "In the Loop"
  | "Deep in the Algorithm";

export type ScoreBreakdownItem = {
  key:
    | "genreConcentration"
    | "artistRepetition"
    | "popularitySkew"
    | "temporalConsistency";
  label: string;
  score: number;
  weight: number;
  explanation: string;
};

export type BubbleScoreResult = {
  score: number;
  tier: ScoreTier;
  organicRatio: number;
  algorithmicRatio: number;
  primaryGenre: {
    name: string;
    share: number;
  };
  averageTrackDurationMs: number;
  genreDistribution: Array<{
    genre: string;
    share: number;
  }>;
  breakdown: ScoreBreakdownItem[];
};

const SCORE_WEIGHTS = {
  genreConcentration: 0.4,
  artistRepetition: 0.25,
  popularitySkew: 0.15,
  temporalConsistency: 0.2,
} as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function normalizeToPercent(value: number) {
  return round(clamp(value, 0, 1) * 100);
}

function getRankWeight(index: number, total: number) {
  const distance = total - index;
  return distance / total;
}

function buildGenreDistribution(artists: SpotifyArtist[]) {
  const genreWeights = new Map<string, number>();
  const totalArtists = artists.length || 1;

  artists.forEach((artist, index) => {
    const weight = getRankWeight(index, totalArtists);
    const genres = artist.genres?.length ? artist.genres : ["unknown"];

    genres.forEach((genre) => {
      genreWeights.set(genre, (genreWeights.get(genre) ?? 0) + weight / genres.length);
    });
  });

  const totalWeight = [...genreWeights.values()].reduce((sum, value) => sum + value, 0) || 1;

  return [...genreWeights.entries()]
    .map(([genre, weight]) => ({
      genre,
      share: weight / totalWeight,
    }))
    .sort((a, b) => b.share - a.share);
}

function computeGenreConcentrationScore(artists: SpotifyArtist[]) {
  const distribution = buildGenreDistribution(artists);
  const hhi = distribution.reduce((sum, item) => sum + item.share * item.share, 0);
  return {
    score: normalizeToPercent(hhi),
    distribution,
  };
}

function computeArtistRepetitionScore(artists: SpotifyArtist[]) {
  const totalArtists = artists.length || 1;
  const weights = artists.map((_, index) => getRankWeight(index, totalArtists));
  const totalWeight = weights.reduce((sum, value) => sum + value, 0) || 1;
  const topFiveWeight = weights.slice(0, 5).reduce((sum, value) => sum + value, 0);

  return normalizeToPercent(topFiveWeight / totalWeight);
}

function computePopularitySkewScore(tracks: SpotifyTrack[]) {
  if (!tracks.length) {
    return 0;
  }

  const averagePopularity =
    tracks.reduce((sum, track) => sum + track.popularity, 0) / tracks.length;

  return round(averagePopularity);
}

function cosineSimilarity(
  left: Array<{ genre: string; share: number }>,
  right: Array<{ genre: string; share: number }>,
) {
  const allGenres = new Set([...left.map((item) => item.genre), ...right.map((item) => item.genre)]);
  const leftMap = new Map(left.map((item) => [item.genre, item.share]));
  const rightMap = new Map(right.map((item) => [item.genre, item.share]));

  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  allGenres.forEach((genre) => {
    const leftValue = leftMap.get(genre) ?? 0;
    const rightValue = rightMap.get(genre) ?? 0;

    dot += leftValue * rightValue;
    leftMagnitude += leftValue * leftValue;
    rightMagnitude += rightValue * rightValue;
  });

  if (!leftMagnitude || !rightMagnitude) {
    return 0;
  }

  return dot / Math.sqrt(leftMagnitude * rightMagnitude);
}

function computeTemporalConsistencyScore(profile: SpotifyProfile) {
  const shortTermGenres = buildGenreDistribution(profile.timeRanges.short_term.topArtists);
  const longTermGenres = buildGenreDistribution(profile.timeRanges.long_term.topArtists);

  return normalizeToPercent(cosineSimilarity(shortTermGenres, longTermGenres));
}

function estimateAlgorithmicRatio(profile: SpotifyProfile, timeRange: TimeRange) {
  const algorithmicPlaylistIds = new Set(
    profile.playlists
      .filter((playlist) => /discover weekly|release radar|daily mix|daylist/i.test(playlist.name))
      .map((playlist) => playlist.id),
  );

  const algorithmicContexts = profile.recentlyPlayed.filter((track) =>
    track.contextName
      ? /discover weekly|release radar|daily mix|daylist|radio/i.test(track.contextName)
      : false,
  ).length;

  const popularityBias =
    profile.timeRanges[timeRange].topTracks.reduce((sum, track) => sum + track.popularity, 0) /
    Math.max(profile.timeRanges[timeRange].topTracks.length, 1);

  const playlistSignal = clamp(algorithmicPlaylistIds.size / 4, 0, 1) * 0.35;
  const contextSignal = clamp(algorithmicContexts / Math.max(profile.recentlyPlayed.length, 1), 0, 1) * 0.4;
  const popularitySignal = clamp((popularityBias - 45) / 45, 0, 1) * 0.25;

  const algorithmicRatio = round(clamp(playlistSignal + contextSignal + popularitySignal, 0.08, 0.92) * 100);

  return {
    algorithmicRatio,
    organicRatio: round(100 - algorithmicRatio),
  };
}

function getScoreTier(score: number): ScoreTier {
  if (score < 30) {
    return "Wide Open";
  }

  if (score < 55) {
    return "Narrowing";
  }

  if (score < 75) {
    return "In the Loop";
  }

  return "Deep in the Algorithm";
}

function getAverageTrackDurationMs(tracks: SpotifyTrack[]) {
  if (!tracks.length) {
    return 0;
  }

  return Math.round(tracks.reduce((sum, track) => sum + track.durationMs, 0) / tracks.length);
}

export function computeBubbleScore(
  profile: SpotifyProfile,
  timeRange: TimeRange = "medium_term",
): BubbleScoreResult {
  const selectedRange = profile.timeRanges[timeRange];
  const genreConcentration = computeGenreConcentrationScore(selectedRange.topArtists);
  const artistRepetition = computeArtistRepetitionScore(selectedRange.topArtists);
  const popularitySkew = computePopularitySkewScore(selectedRange.topTracks);
  const temporalConsistency = computeTemporalConsistencyScore(profile);
  const weightedScore =
    genreConcentration.score * SCORE_WEIGHTS.genreConcentration +
    artistRepetition * SCORE_WEIGHTS.artistRepetition +
    popularitySkew * SCORE_WEIGHTS.popularitySkew +
    temporalConsistency * SCORE_WEIGHTS.temporalConsistency;

  const score = round(weightedScore);
  const primaryGenre = genreConcentration.distribution[0] ?? {
    genre: "unknown",
    share: 0,
  };
  const listeningSplit = estimateAlgorithmicRatio(profile, timeRange);

  return {
    score,
    tier: getScoreTier(score),
    organicRatio: listeningSplit.organicRatio,
    algorithmicRatio: listeningSplit.algorithmicRatio,
    primaryGenre: {
      name: primaryGenre.genre,
      share: round(primaryGenre.share * 100),
    },
    averageTrackDurationMs: getAverageTrackDurationMs(selectedRange.topTracks),
    genreDistribution: genreConcentration.distribution.map((item) => ({
      genre: item.genre,
      share: round(item.share * 100),
    })),
    breakdown: [
      {
        key: "genreConcentration",
        label: "Genre concentration",
        score: genreConcentration.score,
        weight: SCORE_WEIGHTS.genreConcentration,
        explanation:
          "We weight your artist genres by rank, then measure how concentrated that spread is. A monoculture scores higher.",
      },
      {
        key: "artistRepetition",
        label: "Artist repetition",
        score: artistRepetition,
        weight: SCORE_WEIGHTS.artistRepetition,
        explanation:
          "This estimates how much of your listening weight goes to the same small set of artists instead of a broader long tail.",
      },
      {
        key: "popularitySkew",
        label: "Popularity skew",
        score: popularitySkew,
        weight: SCORE_WEIGHTS.popularitySkew,
        explanation:
          "Higher average popularity suggests safer, more heavily promoted listening patterns, though this remains an estimate.",
      },
      {
        key: "temporalConsistency",
        label: "Temporal consistency",
        score: temporalConsistency,
        weight: SCORE_WEIGHTS.temporalConsistency,
        explanation:
          "We compare your short-term and long-term genre vectors. If they look extremely similar, your taste may be looping.",
      },
    ],
  };
}
