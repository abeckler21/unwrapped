import { after } from "next/server";

import { readCachedSpotifyProfile, writeCachedSpotifyProfile } from "@/lib/cache/spotify-profile-cache";
import { mockProfile } from "@/lib/data/mock-profile";
import { enrichProfileWithLastFmGenres } from "@/lib/lastfm/enrich-profile";
import { fetchSpotifyProfile } from "@/lib/spotify/profile";
import { getSpotifySession } from "@/lib/spotify/session";
import { SpotifyProfile } from "@/lib/types/spotify";

function isTokenExpired(expiresAt?: string) {
  if (!expiresAt) {
    return true;
  }

  const expiry = Number(expiresAt);

  if (!Number.isFinite(expiry)) {
    return true;
  }

  return expiry <= Date.now() + 60_000;
}

export async function getCurrentSpotifyProfile(): Promise<{
  profile: SpotifyProfile;
  usingDemoData: boolean;
  isAuthenticated: boolean;
  needsReconnect: boolean;
}> {
  const session = await getSpotifySession();

  if (!session.spotifyUserId) {
    return {
      profile: mockProfile,
      usingDemoData: true,
      isAuthenticated: false,
      needsReconnect: false,
    };
  }

  try {
    const accessToken = session.accessToken;

    if (!accessToken || isTokenExpired(session.tokenExpiresAt)) {
      return {
        profile: mockProfile,
        usingDemoData: true,
        isAuthenticated: false,
        needsReconnect: true,
      };
    }

    const cachedProfile = await readCachedSpotifyProfile(session.spotifyUserId);

    if (cachedProfile) {
      const enrichedCachedProfile = await enrichProfileWithLastFmGenres(cachedProfile);

      if (cachedProfile.isStale) {
        // Serve the stale profile immediately; refresh the cache after the
        // response is sent so the next visit gets fresh data.
        const userId = session.spotifyUserId;
        after(async () => {
          try {
            const fresh = await fetchSpotifyProfile(accessToken);
            await writeCachedSpotifyProfile(userId, fresh);
          } catch {
            // Background refresh failed — stale data remains; retried next visit.
          }
        });
      }

      return {
        profile: enrichedCachedProfile,
        usingDemoData: false,
        isAuthenticated: true,
        needsReconnect: false,
      };
    }

    const profile = await fetchSpotifyProfile(accessToken);
    await writeCachedSpotifyProfile(session.spotifyUserId, profile);
    const enrichedProfile = await enrichProfileWithLastFmGenres(profile);

    return {
      profile: enrichedProfile,
      usingDemoData: false,
      isAuthenticated: true,
      needsReconnect: false,
    };
  } catch {
    return {
      profile: mockProfile,
      usingDemoData: true,
      isAuthenticated: false,
      needsReconnect: true,
    };
  }
}
