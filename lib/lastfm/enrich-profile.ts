import { hasLastFmEnv } from "@/lib/env";
import { getLastFmArtistTags } from "@/lib/lastfm/cache";
import { SpotifyProfile } from "@/lib/types/spotify";

async function enrichArtistsWithLastFmTags(artists: SpotifyProfile["timeRanges"]["medium_term"]["topArtists"]) {
  return Promise.all(
    artists.map(async (artist) => {
      if (artist.genres?.length || !hasLastFmEnv()) {
        return artist;
      }

      try {
        const result = await getLastFmArtistTags(artist.name);

        if (!result?.normalizedTags.length) {
          return artist;
        }

        return {
          ...artist,
          genres: result.normalizedTags,
        };
      } catch {
        return artist;
      }
    }),
  );
}

export async function enrichProfileWithLastFmGenres(profile: SpotifyProfile) {
  if (!hasLastFmEnv()) {
    return profile;
  }

  const [shortArtists, mediumArtists, longArtists] = await Promise.all([
    enrichArtistsWithLastFmTags(profile.timeRanges.short_term.topArtists),
    enrichArtistsWithLastFmTags(profile.timeRanges.medium_term.topArtists),
    enrichArtistsWithLastFmTags(profile.timeRanges.long_term.topArtists),
  ]);

  return {
    ...profile,
    timeRanges: {
      short_term: {
        ...profile.timeRanges.short_term,
        topArtists: shortArtists,
      },
      medium_term: {
        ...profile.timeRanges.medium_term,
        topArtists: mediumArtists,
      },
      long_term: {
        ...profile.timeRanges.long_term,
        topArtists: longArtists,
      },
    },
  };
}
