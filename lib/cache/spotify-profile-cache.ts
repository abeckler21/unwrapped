import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { SpotifyProfile } from "@/lib/types/spotify";

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

const REQUIRED_TIME_RANGES = ["short_term", "medium_term", "long_term"] as const;

function isProfileComplete(profile: unknown): profile is SpotifyProfile {
  if (!profile || typeof profile !== "object") return false;
  const ranges = (profile as Record<string, unknown>).timeRanges;
  if (!ranges || typeof ranges !== "object") return false;
  return REQUIRED_TIME_RANGES.every((r) => r in (ranges as object));
}

type CachedProfileRow = {
  spotify_user_id: string;
  profile: SpotifyProfile;
  fetched_at: string;
};

export type CachedProfile = SpotifyProfile & {
  fetchedFromCache: true;
  /** True when the cache entry is older than 24 h. Caller should revalidate in the background. */
  isStale: boolean;
};

export async function readCachedSpotifyProfile(
  spotifyUserId: string,
  options?: {
    ignoreTtl?: boolean;
  },
): Promise<CachedProfile | null> {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("spotify_profile_cache")
    .select("spotify_user_id, profile, fetched_at")
    .eq("spotify_user_id", spotifyUserId)
    .maybeSingle<CachedProfileRow>();

  if (error || !data) {
    return null;
  }

  if (!isProfileComplete(data.profile)) {
    return null;
  }

  const ageMs = Date.now() - new Date(data.fetched_at).getTime();
  const isStale = ageMs > TWENTY_FOUR_HOURS_MS;

  // Hard-expire only when the caller explicitly respects the TTL
  if (!options?.ignoreTtl && isStale) {
    // Return the stale record so callers can serve it immediately and
    // revalidate in the background, rather than blocking on a fresh fetch.
    return { ...data.profile, fetchedFromCache: true, isStale: true };
  }

  return { ...data.profile, fetchedFromCache: true, isStale: false };
}

export async function writeCachedSpotifyProfile(spotifyUserId: string, profile: SpotifyProfile) {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return;
  }

  await supabase.from("spotify_profile_cache").upsert({
    spotify_user_id: spotifyUserId,
    profile,
    fetched_at: new Date().toISOString(),
  });
}
