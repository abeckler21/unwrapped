export type TimeRange = "short_term" | "medium_term" | "long_term";

export type SpotifyImage = {
  url: string;
  width: number;
  height: number;
};

export type SpotifyArtist = {
  id: string;
  name: string;
  genres: string[];
  followers: number;
  popularity: number;
  images: SpotifyImage[];
};

export type SpotifyAlbum = {
  id: string;
  name: string;
  releaseDate: string;
  images: SpotifyImage[];
};

export type SpotifyTrack = {
  id: string;
  name: string;
  artists: string[];
  album: SpotifyAlbum;
  durationMs: number;
  popularity: number;
  explicit: boolean;
};

export type PlaylistSummary = {
  id: string;
  name: string;
  ownerName: string;
  collaborative: boolean;
  trackCount: number;
};

export type RecentlyPlayedTrack = {
  id: string;
  name: string;
  artistName: string;
  playedAt: string;
  contextName?: string;
};

export type TimeRangeProfile = {
  topArtists: SpotifyArtist[];
  topTracks: SpotifyTrack[];
};

export type SpotifyProfile = {
  userId: string;
  spotifyId: string;
  displayName: string;
  market: string;
  followers: number;
  fetchedFromCache: boolean;
  playlists: PlaylistSummary[];
  recentlyPlayed: RecentlyPlayedTrack[];
  savedTrackCount: number;
  timeRanges: Record<TimeRange, TimeRangeProfile>;
};
