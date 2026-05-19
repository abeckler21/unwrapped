import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { RecommendationCard } from "@/components/escape/recommendation-card"
import { RefreshButton } from "@/components/escape/refresh-button"
import { SavePlaylistButton } from "@/components/escape/save-playlist-button"

export const metadata: Metadata = {
  title: "Escape the Bubble — Unwrapped",
  description: "Artists and tracks outside your algorithmic centroid — hand-picked to break the loop.",
}
import { computeBubbleScore } from "@/lib/analysis/bubble-score"
import { readCachedEscapeRecs, writeCachedEscapeRecs } from "@/lib/escape/cache"
import { generateEscapeRecommendations } from "@/lib/escape/pipeline"
import { getCurrentSpotifyProfile } from "@/lib/spotify/current-profile"
import { getValidAccessToken } from "@/lib/spotify/session"
import type { EscapeRecommendation } from "@/lib/escape/pipeline"

export default async function EscapePage() {
  const { profile, usingDemoData } = await getCurrentSpotifyProfile()
  const accessToken = await getValidAccessToken()

  if (usingDemoData || !accessToken) {
    redirect("/api/auth/login")
  }

  const bubbleScore = computeBubbleScore(profile, "medium_term")

  // ── Try cache first ─────────────────────────────────────────────────────
  let recs: EscapeRecommendation[] | null = await readCachedEscapeRecs(profile.userId)

  // ── Generate if not cached ───────────────────────────────────────────────
  if (!recs) {
    recs = await generateEscapeRecommendations(profile, bubbleScore, accessToken)
    if (recs.length > 0) {
      await writeCachedEscapeRecs(profile.userId, recs)
    }
  }

  // ── Group by gap genre ───────────────────────────────────────────────────
  const byGenre = new Map<string, EscapeRecommendation[]>()
  for (const rec of recs) {
    const group = byGenre.get(rec.gapGenre) ?? []
    group.push(rec)
    byGenre.set(rec.gapGenre, group)
  }

  const trackUris = recs.map((r) => r.track.uri)
  const userGenres = bubbleScore.genreDistribution.slice(0, 3).map((g) => g.genre)
  const isDepthMode = recs.length > 0 && recs.every((r) => r.mode === "depth")

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-5 py-8 sm:px-8">

      {/* Header */}
      <section>
        <h1 className="text-4xl font-bold text-[var(--text-strong)] sm:text-5xl">
          Escape the Bubble
        </h1>
        {isDepthMode ? (
          <>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-muted)]">
              Your taste already spans{" "}
              <span className="text-[var(--text-soft)]">{userGenres.join(", ")}</span>{" "}
              and more — no obvious genre gaps. Instead, here are artists buried deeper in your own
              genres than the first page of obvious Spotify search results.
            </p>
            <p className="mt-2 text-xs text-[var(--text-muted)]">
              Anti-algorithm score: higher = deeper search rank plus more subgenre distance.
            </p>
          </>
        ) : (
          <>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-muted)]">
              Your profile is heavy on{" "}
              <span className="text-[var(--text-soft)]">{userGenres.join(", ")}</span>.
              These artists live outside that centroid and sit deeper in Spotify search than the obvious
              first-page recommendations.
            </p>
            <p className="mt-2 text-xs text-[var(--text-muted)]">
              Anti-algorithm score: higher = deeper search rank plus more distance from your listening centroid.
            </p>
          </>
        )}
      </section>

      {/* No recs fallback — only shown if both gap and depth modes find nothing */}
      {recs.length === 0 && (
        <div className="panel p-8 text-center">
          <p className="text-xl font-semibold text-[var(--text-strong)]">
            Spotify returned no recommendations right now.
          </p>
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            This can happen when Spotify&apos;s search returns limited results for your genres.
            Try again in a few minutes — results vary by region and catalog availability.
          </p>
        </div>
      )}

      {/* Recommendations by genre */}
      {[...byGenre.entries()].map(([genre, genreRecs]) => {
        const sectionMode = genreRecs[0]?.mode ?? "gap"
        return (
        <section key={genre} className="flex flex-col gap-4">
          <div>
            <p className="eyebrow">{sectionMode === "depth" ? "Hidden depth" : "Gap genre"}</p>
            <h2 className="mt-1 text-xl font-semibold capitalize text-[var(--text-strong)]">
              {genre}
            </h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {sectionMode === "depth"
                ? "Within your own taste · deeper search rank · less obvious"
                : "Absent from your top 8 genres · filtered out of your recommendations"}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {genreRecs.map((rec) => (
              <RecommendationCard key={rec.artist.id} rec={rec} />
            ))}
          </div>
        </section>
        )
      })}

      {/* Playlist CTA */}
      {recs.length > 0 && (
        <section className="panel p-6 sm:p-8">
          <p className="eyebrow">Your escape route</p>
          <h2 className="mt-2 text-lg font-semibold text-[var(--text-strong)]">
            Save all {recs.length} artists as a Spotify playlist
          </h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            One track per artist, grouped by the gap genre each one fills.
            A month from now, come back and see if any of them made it into your top artists.
          </p>
          <div className="mt-6">
            <SavePlaylistButton trackUris={trackUris} />
          </div>
        </section>
      )}

      {/* Methodology note + refresh */}
      {recs.length > 0 && (
        <footer className="flex flex-col gap-4 border-t border-white/10 pt-6">
          <p className="text-xs text-[var(--text-muted)]">
            {isDepthMode
              ? "Your taste spans most tracked genres, so recommendations use depth mode: artists in your own genres scored by deeper Spotify search rank and subgenre novelty."
              : "Recommendations are generated by searching Spotify for artists tagged with genres absent from your profile, then scoring by deeper Spotify search rank and distance from your listening centroid."}
            {" "}Results are cached for 24 hours. Track selection is each artist&apos;s Spotify top track
            in your market.
          </p>
          <RefreshButton />
        </footer>
      )}

    </main>
  )
}
