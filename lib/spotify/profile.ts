import { SpotifyProfile } from "@/lib/types/spotify";
import { SPOTIFY_API_BASE_URL } from "@/lib/spotify/constants";

type SpotifyUserResponse = {
  id: string;
  display_name: string | null;
  country: string | null;
  followers: {
    total: number;
  };
};

type SpotifyArtistResponse = {
  id: string;
  name: string;
  genres: string[];
  followers: {
    total: number;
  };
  popularity: number;
  images: Array<{
    url: string;
    width: number;
    height: number;
  }>;
};

type SpotifyTrackResponse = {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    id: string;
    name: string;
    release_date: string;
    images: Array<{
      url: string;
      width: number;
      height: number;
    }>;
  };
  duration_ms: number;
  popularity: number;
  explicit: boolean;
};

type SpotifyPlaylistResponse = {
  id: string;
  name: string;
  owner: {
    display_name: string;
  };
  collaborative: boolean;
  tracks: {
    total: number;
  };
};

type SpotifyRecentlyPlayedResponse = {
  track: {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
  };
  played_at: string;
  context: {
    type: string;
    href: string | null;
  } | null;
};

async function spotifyFetch<T>(path: string, accessToken: string) {
  const response = await fetch(`${SPOTIFY_API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Spotify API request failed for ${path} with status ${response.status}.`);
  }

  return (await response.json()) as T;
}

export async function fetchCurrentSpotifyUser(accessToken: string) {
  return spotifyFetch<SpotifyUserResponse>("/me", accessToken);
}

export async function fetchSpotifyProfile(accessToken: string): Promise<SpotifyProfile> {
  const [user, shortArtists, mediumArtists, longArtists, shortTracks, mediumTracks, longTracks, playlists, recentlyPlayed, savedTracks] =
    await Promise.all([
      fetchCurrentSpotifyUser(accessToken),
      spotifyFetch<{ items: SpotifyArtistResponse[] }>("/me/top/artists?time_range=short_term&limit=20", accessToken),
      spotifyFetch<{ items: SpotifyArtistResponse[] }>("/me/top/artists?time_range=medium_term&limit=20", accessToken),
      spotifyFetch<{ items: SpotifyArtistResponse[] }>("/me/top/artists?time_range=long_term&limit=20", accessToken),
      spotifyFetch<{ items: SpotifyTrackResponse[] }>("/me/top/tracks?time_range=short_term&limit=20", accessToken),
      spotifyFetch<{ items: SpotifyTrackResponse[] }>("/me/top/tracks?time_range=medium_term&limit=20", accessToken),
      spotifyFetch<{ items: SpotifyTrackResponse[] }>("/me/top/tracks?time_range=long_term&limit=20", accessToken),
      spotifyFetch<{ items: SpotifyPlaylistResponse[] }>("/me/playlists?limit=20", accessToken),
      spotifyFetch<{ items: SpotifyRecentlyPlayedResponse[] }>("/me/player/recently-played?limit=50", accessToken),
      spotifyFetch<{ total: number }>("/me/tracks?limit=1", accessToken),
    ]);

  const mapArtist = (artist: SpotifyArtistResponse) => ({
    id: artist.id,
    name: artist.name,
    genres: artist.genres,
    followers: artist.followers.total,
    popularity: artist.popularity,
    images: artist.images,
  });

  const mapTrack = (track: SpotifyTrackResponse) => ({
    id: track.id,
    name: track.name,
    artists: track.artists.map((artist) => artist.name),
    album: {
      id: track.album.id,
      name: track.album.name,
      releaseDate: track.album.release_date,
      images: track.album.images,
    },
    durationMs: track.duration_ms,
    popularity: track.popularity,
    explicit: track.explicit,
  });

  return {
    userId: user.id,
    spotifyId: user.id,
    displayName: user.display_name ?? "Spotify User",
    market: user.country ?? "unknown",
    followers: user.followers.total,
    fetchedFromCache: false,
    savedTrackCount: savedTracks.total,
    playlists: playlists.items.map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      ownerName: playlist.owner.display_name,
      collaborative: playlist.collaborative,
      trackCount: playlist.tracks.total,
    })),
    recentlyPlayed: recentlyPlayed.items.map((item) => ({
      id: item.track.id,
      name: item.track.name,
      artistName: item.track.artists.map((artist) => artist.name).join(", "),
      playedAt: item.played_at,
      contextName: item.context?.type,
    })),
    timeRanges: {
      short_term: {
        topArtists: shortArtists.items.map(mapArtist),
        topTracks: shortTracks.items.map(mapTrack),
      },
      medium_term: {
        topArtists: mediumArtists.items.map(mapArtist),
        topTracks: mediumTracks.items.map(mapTrack),
      },
      long_term: {
        topArtists: longArtists.items.map(mapArtist),
        topTracks: longTracks.items.map(mapTrack),
      },
    },
  };
}
