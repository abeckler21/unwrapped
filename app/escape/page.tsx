import Link from "next/link"
import { redirect } from "next/navigation"

import { RecommendationCard } from "@/components/escape/recommendation-card"
import { SavePlaylistButton } from "@/components/escape/save-playlist-button"
import { computeBubbleScore } from "@/lib/analysis/bubble-score"
import { readCachedEscapeRecs, writeCachedEscapeRecs } from "@/lib/escape/cache"
import { generateEscapeRecommendations } from "@/lib/escape/pipeline"
import { getCurrentSpotifyProfile } from "@/lib/spotify/current-profile"
import { getSpotifySession } from "@/lib/spotify/session"
import type { EscapeRecommendation } from "@/lib/escape/pipeline"

export default async function EscapePage() {
  const { profile, usingDemoData } = await getCurrentSpotifyProfile()
  const session = await getSpotifySession()

  if (usingDemoData || !session.accessToken) {
    redirect("/api/auth/login")
  }

  const bubbleScore = computeBubbleScore(profile, "medium_term")

  // ── Try cache first ─────────────────────────────────────────────────────
  let recs: EscapeRecommendation[] | null = await readCachedEscapeRecs(profile.userId)

  // ── Generate if not cached ───────────────────────────────────────────────
  if (!recs) {
    recs = await generateEscapeRecommendations(profile, bubbleScore, session.accessToken)
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

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-5 py-8 sm:px-8">

      {/* Header */}
      <section>
        <Link
          href="/dashboard"
          className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-[var(--text-soft)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          ← Back to dashboard
        </Link>
        <h1 className="mt-4 text-4xl font-bold text-[var(--text-strong)] sm:text-5xl">
          Escape the Bubble
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-muted)]">
          Your profile is heavy on{" "}
          <span className="text-[var(--text-soft)]">{userGenres.join(", ")}</span>.
          These artists live outside that centroid — low enough popularity to be invisible to the
          algorithm, deep enough catalogs to be worth exploring.
        </p>
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          Anti-algorithm score: higher = less likely the algorithm would ever surface this artist to you.
        </p>
      </section>

      {/* No recs fallback */}
      {recs.length === 0 && (
        <div className="panel p-8 text-center">
          <p className="text-xl font-semibold text-[var(--text-strong)]">
            Your profile is already unusually broad.
          </p>
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            We couldn&apos;t find enough gap genres to generate recommendations.
            This is rare — your listening spans most of what we check against.
          </p>
          <Link href="/dashboard" className="button-secondary mt-6 inline-flex text-sm">
            Back to dashboard
          </Link>
        </div>
      )}

      {/* Recommendations by genre */}
      {[...byGenre.entries()].map(([genre, genreRecs]) => (
        <section key={genre} className="flex flex-col gap-4">
          <div>
            <p className="eyebrow">Gap genre</p>
            <h2 className="mt-1 text-xl font-semibold capitalize text-[var(--text-strong)]">
              {genre}
            </h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Absent from your top 8 genres · filtered out of your recommendations
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {genreRecs.map((rec) => (
              <RecommendationCard key={rec.artist.id} rec={rec} />
            ))}
          </div>
        </section>
      ))}

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

      {/* Methodology note */}
      {recs.length > 0 && (
        <footer className="border-t border-white/10 pt-6 text-xs text-[var(--text-muted)]">
          Recommendations are generated by searching Spotify for artists tagged with genres absent
          from your profile, then filtering to popularity 20–55 (known but not algorithmically
          prominent) and scoring by how far they sit from your listening centroid.
          Results are cached for 24 hours. Track selection is each artist&apos;s Spotify top track
          in your market.
        </footer>
      )}

    </main>
  )
}
