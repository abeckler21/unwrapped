import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import { fetchLastFmArtistTags, LastFmArtistTagsResult } from "@/lib/lastfm/client";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

type LastFmArtistTagCacheRow = {
  normalized_artist_name: string;
  artist_name: string;
  raw_tags: string[];
  normalized_tags: string[];
  fetched_at: string;
};

function normalizeArtistName(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, " ");
}

async function readCachedArtistTags(artistName: string) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("lastfm_artist_tags_cache")
    .select("normalized_artist_name, artist_name, raw_tags, normalized_tags, fetched_at")
    .eq("normalized_artist_name", normalizeArtistName(artistName))
    .maybeSingle<LastFmArtistTagCacheRow>();

  if (error || !data) {
    return null;
  }

  const ageMs = Date.now() - new Date(data.fetched_at).getTime();

  if (ageMs > SEVEN_DAYS_MS) {
    return null;
  }

  return {
    artistName: data.artist_name,
    rawTags: data.raw_tags ?? [],
    normalizedTags: data.normalized_tags ?? [],
  } satisfies LastFmArtistTagsResult;
}

async function writeCachedArtistTags(artistName: string, result: LastFmArtistTagsResult) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return;
  }

  await supabase.from("lastfm_artist_tags_cache").upsert({
    normalized_artist_name: normalizeArtistName(artistName),
    artist_name: result.artistName,
    raw_tags: result.rawTags,
    normalized_tags: result.normalizedTags,
    fetched_at: new Date().toISOString(),
  });
}

export async function getLastFmArtistTags(artistName: string) {
  const cached = await readCachedArtistTags(artistName);

  if (cached) {
    return cached;
  }

  const fresh = await fetchLastFmArtistTags(artistName);

  if (!fresh) {
    return null;
  }

  await writeCachedArtistTags(artistName, fresh);

  return fresh;
}
