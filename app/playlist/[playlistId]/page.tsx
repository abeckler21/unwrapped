import Link from "next/link"
import { notFound } from "next/navigation"

import { AlgorithmScoreCard } from "@/components/playlist/algorithm-score-card"
import { EraChart } from "@/components/playlist/era-chart"
import { TrackList } from "@/components/playlist/track-list"
import { readCachedPlaylistAutopsy, writeCachedPlaylistAutopsy } from "@/lib/playlist/cache"
import { analyzePlaylist } from "@/lib/playlist/autopsy"
import { getSpotifySession } from "@/lib/spotify/session"

type Props = {
  params: Promise<{ playlistId: string }>
}

export default async function PlaylistAutopsyPage({ params }: Props) {
  const { playlistId } = await params
  const session = await getSpotifySession()

  if (!session.accessToken) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-5 py-8 sm:px-8">
        <p className="text-sm text-[var(--text-muted)]">
          You need to be logged in to analyze playlists.{" "}
          <Link href="/api/auth/login" className="text-[var(--accent)]">
            Log in with Spotify →
          </Link>
        </p>
      </main>
    )
  }

  // Try cache first
  let autopsy = await readCachedPlaylistAutopsy(playlistId)

  if (!autopsy) {
    try {
      autopsy = await analyzePlaylist(playlistId, session.accessToken)
      await writeCachedPlaylistAutopsy(playlistId, autopsy)
    } catch {
      notFound()
    }
  }

  if (!autopsy) notFound()

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-5 py-8 sm:px-8">

      {/* Header */}
      <section>
        <Link
          href="/playlist"
          className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-[var(--text-soft)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          ← Analyze another playlist
        </Link>

        <div className="mt-6 flex items-center gap-4">
          {autopsy.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={autopsy.coverImageUrl}
              alt={autopsy.name}
              className="h-16 w-16 rounded-xl object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-xl bg-white/10" />
          )}
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-strong)] sm:text-3xl">
              {autopsy.name}
            </h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              by {autopsy.ownerName}
              {autopsy.isSpotifyOwned && (
                <span className="ml-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-2 py-0.5 text-xs text-[var(--accent)]">
                  Spotify-owned
                </span>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Algorithm Score */}
      <AlgorithmScoreCard autopsy={autopsy} />

      {/* Era distribution */}
      {autopsy.eraDistribution.length > 0 && (
        <section className="panel p-6 sm:p-8">
          <p className="eyebrow">Era Distribution</p>
          <h2 className="mt-1 text-lg font-semibold text-[var(--text-strong)]">
            When was this playlist made from?
          </h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Heavy recency = likely algorithm-driven. Even distribution = curation.
          </p>
          <div className="mt-5">
            <EraChart data={autopsy.eraDistribution} />
          </div>
        </section>
      )}

      {/* Genre breakdown */}
      {autopsy.genreDistribution.length > 0 && (
        <section className="panel p-6 sm:p-8">
          <p className="eyebrow">Genre Breakdown</p>
          <h2 className="mt-1 text-lg font-semibold text-[var(--text-strong)]">
            Top genres
          </h2>
          <div className="mt-4 flex flex-col gap-3">
            {autopsy.genreDistribution.map((g) => {
              const max = autopsy!.genreDistribution[0].count
              return (
                <div key={g.genre} className="flex items-center gap-3">
                  <span className="w-36 shrink-0 truncate text-xs text-[var(--text-soft)] capitalize">
                    {g.genre}
                  </span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--accent)]/60"
                      style={{ width: `${(g.count / max) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-xs tabular-nums text-[var(--text-muted)]">
                    {g.count}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Track list */}
      <section className="panel p-6 sm:p-8">
        <p className="eyebrow">Track List</p>
        <h2 className="mt-1 text-lg font-semibold text-[var(--text-strong)]">
          {autopsy.tracks.length} tracks analyzed
        </h2>
        <div className="mt-4">
          <TrackList tracks={autopsy.tracks} />
        </div>
      </section>

      {/* Methodology */}
      <footer className="border-t border-white/10 pt-6 text-xs text-[var(--text-muted)]">
        Algorithm Score is computed from: playlist name patterns (max 30), Spotify ownership (max 20),
        popularity skew above 45 (max 25), recency bias (tracks from last 2 years, max 15), and
        genre homogeneity via HHI (max 10). Results cached for 6 hours.
      </footer>

    </main>
  )
}
