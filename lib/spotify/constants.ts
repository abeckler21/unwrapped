export const SPOTIFY_SCOPES = [
  "user-top-read",
  "user-read-recently-played",
  "user-library-read",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
];

export const SPOTIFY_ACCOUNTS_BASE_URL = "https://accounts.spotify.com";
export const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";

export const SESSION_COOKIE_NAMES = {
  accessToken: "unwrapped_access_token",
  refreshToken: "unwrapped_refresh_token",
  tokenExpiresAt: "unwrapped_token_expires_at",
  spotifyUserId: "unwrapped_spotify_user_id",
  oauthState: "unwrapped_oauth_state",
  pkceVerifier: "unwrapped_pkce_verifier",
} as const;
