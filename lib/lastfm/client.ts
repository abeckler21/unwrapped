import { env, hasLastFmEnv } from "@/lib/env";
import { normalizeLastFmTags } from "@/lib/lastfm/normalize-tags";

const LASTFM_API_BASE_URL = "https://ws.audioscrobbler.com/2.0/";

type LastFmTopTagsResponse = {
  toptags?: {
    "@attr"?: {
      artist?: string;
    };
    tag?: Array<{
      name?: string;
      count?: number | string;
    }>;
  };
  error?: number;
  message?: string;
};

export type LastFmArtistTagsResult = {
  artistName: string;
  rawTags: string[];
  normalizedTags: string[];
};

export async function fetchLastFmArtistTags(artistName: string) {
  if (!hasLastFmEnv()) {
    return null;
  }

  const url = new URL(LASTFM_API_BASE_URL);
  url.searchParams.set("method", "artist.getTopTags");
  url.searchParams.set("artist", artistName);
  url.searchParams.set("autocorrect", "1");
  url.searchParams.set("api_key", env.LASTFM_API_KEY!);
  url.searchParams.set("format", "json");

  const response = await fetch(url.toString(), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Last.fm artist.getTopTags failed (${response.status}).`);
  }

  const payload = (await response.json()) as LastFmTopTagsResponse;

  if (payload.error) {
    throw new Error(`Last.fm artist.getTopTags failed (${payload.error}): ${payload.message}`);
  }

  const rawTags = (payload.toptags?.tag ?? [])
    .map((tag) => tag.name?.trim())
    .filter((tag): tag is string => Boolean(tag))
    .slice(0, 12);

  return {
    artistName: payload.toptags?.["@attr"]?.artist ?? artistName,
    rawTags,
    normalizedTags: normalizeLastFmTags(rawTags),
  } satisfies LastFmArtistTagsResult;
}
