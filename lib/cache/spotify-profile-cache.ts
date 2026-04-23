import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { SpotifyProfile } from "@/lib/types/spotify";

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

type CachedProfileRow = {
  spotify_user_id: string;
  profile: SpotifyProfile;
  fetched_at: string;
};

export async function readCachedSpotifyProfile(
  spotifyUserId: string,
  options?: {
    ignoreTtl?: boolean;
  },
) {
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

  const ageMs = Date.now() - new Date(data.fetched_at).getTime();

  if (!options?.ignoreTtl && ageMs > TWENTY_FOUR_HOURS_MS) {
    return null;
  }

  return {
    ...data.profile,
    fetchedFromCache: true,
  };
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
