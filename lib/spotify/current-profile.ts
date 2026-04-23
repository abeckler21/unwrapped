import { readCachedSpotifyProfile, writeCachedSpotifyProfile } from "@/lib/cache/spotify-profile-cache";
import { mockProfile } from "@/lib/data/mock-profile";
import { refreshSpotifyAccessToken } from "@/lib/spotify/auth";
import { fetchSpotifyProfile } from "@/lib/spotify/profile";
import {
  clearSpotifySessionCookies,
  getSpotifySession,
  setSpotifySessionCookies,
} from "@/lib/spotify/session";
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
}> {
  const session = await getSpotifySession();

  if (!session.spotifyUserId) {
    return {
      profile: mockProfile,
      usingDemoData: true,
      isAuthenticated: false,
    };
  }

  try {
    let accessToken = session.accessToken;
    let refreshToken = session.refreshToken;

    if (!accessToken || isTokenExpired(session.tokenExpiresAt)) {
      if (!refreshToken) {
        throw new Error("Spotify refresh token is missing.");
      }

      const refreshed = await refreshSpotifyAccessToken(refreshToken);
      accessToken = refreshed.access_token;
      refreshToken = refreshed.refresh_token ?? refreshToken;

      await setSpotifySessionCookies({
        accessToken,
        refreshToken,
        expiresInSeconds: refreshed.expires_in,
        spotifyUserId: session.spotifyUserId,
      });
    }

    const cachedProfile = await readCachedSpotifyProfile(session.spotifyUserId);

    if (cachedProfile) {
      return {
        profile: cachedProfile,
        usingDemoData: false,
        isAuthenticated: true,
      };
    }

    if (!accessToken) {
      throw new Error("Spotify access token is missing.");
    }

    const profile = await fetchSpotifyProfile(accessToken);
    await writeCachedSpotifyProfile(session.spotifyUserId, profile);

    return {
      profile,
      usingDemoData: false,
      isAuthenticated: true,
    };
  } catch {
    await clearSpotifySessionCookies();

    return {
      profile: mockProfile,
      usingDemoData: true,
      isAuthenticated: false,
    };
  }
}
