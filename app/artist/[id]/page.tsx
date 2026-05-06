import Link from "next/link"
import { notFound } from "next/navigation"

import { AoiChart } from "@/components/artist/aoi-chart"
import { CareerChart } from "@/components/artist/career-chart"
import { readCachedArtistAnalysis, writeCachedArtistAnalysis } from "@/lib/artist/cache"
import { analyzeArtist } from "@/lib/artist/analysis"
import { getValidAccessToken } from "@/lib/spotify/session"

type Props = {
  params: Promise<{ id: string }>
}

function fmtFollowers(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`
  return String(n)
}

function msToMin(ms: number) {
  const s = ms / 1000
  return `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`
}

export default async function ArtistPage({ params }: Props) {
  const { id } = await params
  const accessToken = await getValidAccessToken()

  if (!accessToken) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-5 py-8 sm:px-8">
        <p className="text-sm text-[var(--text-muted)]">
          You need to be logged in to view artist dashboards.{" "}
          <Link href="/api/auth/login" className="text-[var(--accent)]">
            Log in with Spotify →
          </Link>
        </p>
      </main>
    )
  }

  // Try cache
  let analysis = await readCachedArtistAnalysis(id)
  let fetchError: string | null = null

  if (!analysis) {
    try {
      analysis = await analyzeArtist(id, accessToken)
      await writeCachedArtistAnalysis(id, analysis)
    } catch (err) {
      fetchError = err instanceof Error ? err.message : "Failed to load artist data."
    }
  }

  if (fetchError || !analysis) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-5 py-8 sm:px-8">
        <Link
          href="/artist"
          className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-[var(--text-soft)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          ← Search artists
        </Link>
        <div className="panel p-6">
          <p className="text-sm font-semibold text-[var(--text-strong)]">Could not load artist</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {fetchError ?? "Artist not found."}
          </p>
        </div>
      </main>
    )
  }

  const careerData = analysis.albums
    .filter((a) => a.albumType !== "single")
    .map((a) => ({ year: a.releaseYear, avgDurationMs: a.avgDurationMs }))

  const highestAoi = analysis.albums.reduce(
    (best, a) => (a.aoi > best.aoi ? a : best),
    analysis.albums[0],
  )

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-5 py-8 sm:px-8">

      {/* Header */}
      <section>
        <Link
          href="/artist"
          className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-[var(--text-soft)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          ← Search artists
        </Link>

        <div className="mt-6 flex items-center gap-5">
          {analysis.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={analysis.imageUrl}
              alt={analysis.name}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-3xl font-bold text-[var(--text-muted)]">
              {analysis.name[0]}
            </div>
          )}
          <div>
            <h1 className="text-4xl font-bold text-[var(--text-strong)] sm:text-5xl">
              {analysis.name}
            </h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {analysis.genres.slice(0, 3).join(" · ")}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-6">
          <div>
            <p className="text-xs text-[var(--text-muted)]">Followers</p>
            <p className="mt-0.5 text-xl font-semibold tabular-nums text-[var(--text-strong)]">
              {fmtFollowers(analysis.followers)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">Popularity</p>
            <p className="mt-0.5 text-xl font-semibold tabular-nums text-[var(--text-strong)]">
              {analysis.popularity}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">Albums analyzed</p>
            <p className="mt-0.5 text-xl font-semibold tabular-nums text-[var(--text-strong)]">
              {analysis.albums.length}
            </p>
          </div>
          {highestAoi && (
            <div>
              <p className="text-xs text-[var(--text-muted)]">Peak AOI</p>
              <p className="mt-0.5 text-xl font-semibold tabular-nums text-[var(--text-accent)]">
                {highestAoi.aoi}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Song length over career */}
      {careerData.length >= 2 && (
        <section className="panel p-6 sm:p-8">
          <p className="eyebrow">Song Length Trend</p>
          <h2 className="mt-1 text-lg font-semibold text-[var(--text-strong)]">
            Average track length per album
          </h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Dashed line = industry average (~3:30). Shorter songs correlate with algorithmic optimization.
          </p>
          <div className="mt-5">
            <CareerChart data={careerData} />
          </div>
        </section>
      )}

      {/* Algorithm Optimization Index */}
      <section className="panel p-6 sm:p-8">
        <p className="eyebrow">Algorithm Optimization Index</p>
        <h2 className="mt-1 text-lg font-semibold text-[var(--text-strong)]">
          AOI per album
        </h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          0–100. Higher = shorter songs + more features/collabs. Measures how algorithmically engineered each album is.
        </p>
        <div className="mt-5">
          <AoiChart albums={analysis.albums} />
        </div>
      </section>

      {/* Popularity trajectory */}
      {analysis.popularityTrajectory.length >= 2 && (
        <section className="panel p-6 sm:p-8">
          <p className="eyebrow">Popularity Trajectory</p>
          <h2 className="mt-1 text-lg font-semibold text-[var(--text-strong)]">
            Peak popularity per year
          </h2>
          <div className="mt-4 flex flex-col gap-2">
            {analysis.popularityTrajectory.map((pt) => (
              <div key={pt.year} className="flex items-center gap-3">
                <span className="w-10 shrink-0 text-xs tabular-nums text-[var(--text-muted)]">
                  {pt.year}
                </span>
                <div className="flex-1 h-2 rounded-full bg-white/8 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--accent)]/60"
                    style={{ width: `${pt.popularity}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-xs tabular-nums text-[var(--text-muted)]">
                  {pt.popularity}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Album table */}
      <section className="panel p-6 sm:p-8">
        <p className="eyebrow">Discography</p>
        <h2 className="mt-1 text-lg font-semibold text-[var(--text-strong)]">
          All albums &amp; singles
        </h2>
        <div className="mt-4 flex flex-col divide-y divide-white/6">
          {analysis.albums.map((album) => (
            <div
              key={album.id}
              className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
            >
              {album.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={album.coverImageUrl}
                  alt={album.name}
                  className="h-10 w-10 shrink-0 rounded-md object-cover"
                />
              ) : (
                <div className="h-10 w-10 shrink-0 rounded-md bg-white/10" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--text-strong)]">
                  {album.name}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {album.releaseYear} · {album.trackCount} tracks · avg {msToMin(album.avgDurationMs)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-[var(--text-muted)]">AOI</p>
                <p
                  className={`text-sm font-semibold tabular-nums ${
                    album.aoi >= 70
                      ? "text-orange-400"
                      : album.aoi >= 40
                        ? "text-[var(--text-soft)]"
                        : "text-[var(--text-muted)]"
                  }`}
                >
                  {album.aoi}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Genre drift note */}
      {analysis.genreDrift.length > 0 && (
        <section className="panel p-6 sm:p-8">
          <p className="eyebrow">Genre Drift</p>
          <h2 className="mt-1 text-lg font-semibold text-[var(--text-strong)]">
            Sound over time
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {analysis.genreDrift.map((g) => (
              <span
                key={g}
                className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-[var(--text-soft)]"
              >
                {g}
              </span>
            ))}
          </div>
        </section>
      )}

    </main>
  )
}
