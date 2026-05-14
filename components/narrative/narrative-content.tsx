import Image from "next/image"
import Link from "next/link"

import { ScrollReveal } from "./scroll-reveal"
import { CountUp } from "./count-up"
import { ChapterProgress } from "./chapter-progress"
import { formatDuration } from "@/lib/format"
import { detectGapGenres } from "@/lib/escape/genres"
import { computeIMIAggregate, IMI_ENGINEERED_THRESHOLD } from "@/lib/analysis/imi"
import {
  songLengthTrend,
  genreShareTrend,
  popularityConcentrationTrend,
} from "@/lib/data/macro-trends"
import type { BubbleScoreResult } from "@/lib/analysis/bubble-score"
import type { Archetype } from "@/lib/ai/archetype"
import type { SpotifyProfile } from "@/lib/types/spotify"
import type { EscapeRecommendation } from "@/lib/escape/pipeline"

type Props = {
  profile: SpotifyProfile
  usingDemoData: boolean
  score: BubbleScoreResult
  archetype: Archetype
  escapeRecs: EscapeRecommendation[] | null
}

function tierColor(tier: string) {
  switch (tier) {
    case "Wide Open":
      return "text-[var(--accent-cool)]"
    case "Narrowing":
      return "text-yellow-400"
    case "In the Loop":
      return "text-[var(--accent)]"
    case "Deep in the Algorithm":
      return "text-red-400"
    default:
      return "text-[var(--accent)]"
  }
}

function SubScoreBar({
  label,
  score,
  weight,
}: {
  label: string
  score: number
  weight: number
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--text-soft)]">{label}</span>
        <span className="tabular-nums text-[var(--text-muted)]">
          {Math.round(score)}
          <span className="text-xs"> / 100</span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-none"
          style={{ width: `${Math.round(score)}%`, opacity: 0.4 + weight * 0.6 }}
        />
      </div>
    </div>
  )
}

function ArtistCard({ rec }: { rec: EscapeRecommendation }) {
  return (
    <article className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      {rec.artist.imageUrl ? (
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
          <Image
            src={rec.artist.imageUrl}
            alt={rec.artist.name}
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06]">
          <span className="text-sm font-semibold text-[var(--accent)]">
            {rec.artist.name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <a
          href={rec.artist.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate text-sm font-semibold text-[var(--text-strong)] hover:text-[var(--accent)] transition-colors"
        >
          {rec.artist.name}
        </a>
        <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
          {rec.gapGenre} · score {rec.antiAlgorithmScore}
        </p>
        <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
          {rec.track.name}
        </p>
      </div>
    </article>
  )
}

export function NarrativeContent({
  profile,
  usingDemoData,
  score,
  archetype,
  escapeRecs,
}: Props) {
  const topGenres = score.genreDistribution.slice(0, 3)
  const topArtists = profile.timeRanges.medium_term.topArtists.slice(0, 3)

  const artistRepItem = score.breakdown.find((b) => b.key === "artistRepetition")
  const temporalItem = score.breakdown.find((b) => b.key === "temporalConsistency")

  // Macro context
  const peakEntry = songLengthTrend.reduce((max, d) =>
    d.avgDurationMinutes > max.avgDurationMinutes ? d : max,
  )
  const latestSongLength = songLengthTrend[songLengthTrend.length - 1]
  const userMinutes = score.averageTrackDurationMs / 60_000
  const userDurationLabel = formatDuration(score.averageTrackDurationMs)
  const userVsAvg =
    userMinutes < latestSongLength.avgDurationMinutes ? "below" : "above"

  const genre2024 = genreShareTrend[genreShareTrend.length - 1]
  const popHipHop = genre2024.pop + genre2024.hipHop

  const earliest = popularityConcentrationTrend[0]
  const latest = popularityConcentrationTrend[popularityConcentrationTrend.length - 1]

  // Genre gaps for chapter 4
  const userGenreNames = score.genreDistribution.map((g) => g.genre)
  const gapGenres = detectGapGenres(userGenreNames, 8)

  // IMI aggregate for Chapter III
  const imiAgg = computeIMIAggregate(profile.timeRanges.medium_term.topTracks)

  // Split escape recs across chapters 4 and 5
  const recs4 = escapeRecs?.slice(0, 3) ?? []
  const recs5 = escapeRecs?.slice(3) ?? []

  return (
    <div className="relative">
      <ChapterProgress />

      {/* ── Chapter 1: Where You Are ──────────────────────────────── */}
      <section
        id="ch-1"
        className="flex min-h-screen flex-col items-center justify-center px-5 py-32 sm:px-8"
      >
        <div className="mx-auto w-full max-w-2xl space-y-12 text-center">
          <ScrollReveal>
            <p className="eyebrow text-[var(--accent)]">Chapter I</p>
            <h2 className="mt-3 text-4xl font-bold text-[var(--text-strong)] sm:text-5xl">
              Where You Are
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={120}>
            <blockquote className="mx-auto max-w-xl text-xl leading-relaxed text-[var(--text-soft)] italic sm:text-2xl">
              &ldquo;{archetype.prose}&rdquo;
            </blockquote>
          </ScrollReveal>

          <ScrollReveal delay={240}>
            <div className="space-y-3">
              <p className="eyebrow">Filter Bubble Score</p>
              <div className="flex items-baseline justify-center gap-3">
                <CountUp
                  target={Math.round(score.score)}
                  duration={1600}
                  className="text-[clamp(5rem,18vw,9rem)] font-bold leading-none tabular-nums text-[var(--accent)]"
                />
                <span className="text-4xl font-light text-[var(--text-muted)]">/100</span>
              </div>
              <p className={`text-xl font-semibold ${tierColor(score.tier)}`}>
                {score.tier}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={360}>
            <div className="mx-auto grid max-w-lg grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="p-5 text-center">
                <p className="text-2xl font-bold tabular-nums text-[var(--text-strong)]">
                  {score.algorithmicRatio}%
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  algorithmic exposure
                </p>
              </div>
              <div className="p-5 text-center">
                <p className="truncate text-sm font-semibold text-[var(--text-strong)]">
                  {score.primaryGenre.name}
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  primary genre ({score.primaryGenre.share}%)
                </p>
              </div>
              <div className="p-5 text-center">
                <p className="text-2xl font-bold tabular-nums text-[var(--text-strong)]">
                  {userDurationLabel}
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">avg track length</p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={480}>
            <p className="text-sm text-[var(--text-muted)]">
              &#8595; scroll to understand how
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Chapter 2: How You Got Here ───────────────────────────── */}
      <section
        id="ch-2"
        className="flex min-h-screen flex-col justify-center border-t border-white/6 px-5 py-32 sm:px-8"
      >
        <div className="mx-auto w-full max-w-2xl space-y-12">
          <ScrollReveal>
            <p className="eyebrow text-[var(--accent)]">Chapter II</p>
            <h2 className="mt-3 text-4xl font-bold text-[var(--text-strong)] sm:text-5xl">
              How You Got Here
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <p className="text-xl leading-relaxed text-[var(--text-soft)]">
              Your taste didn&apos;t narrow all at once. The algorithm is patient. It
              learns your signal and gradually amplifies it — week by week,
              playlist by playlist, autoplay by autoplay.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <p className="text-lg text-[var(--text-soft)]">Here&apos;s the pattern:</p>
          </ScrollReveal>

          {/* Large stat callouts */}
          <div className="space-y-6">
            {topGenres[0] && (
              <ScrollReveal delay={250}>
                <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-6">
                  <p className="text-4xl font-bold tabular-nums text-[var(--accent)] sm:text-5xl">
                    {topGenres[0].share}%
                  </p>
                  <p className="mt-2 text-[var(--text-soft)]">
                    of your listening is{" "}
                    <span className="font-semibold text-[var(--text-strong)]">
                      {topGenres[0].genre}
                    </span>
                    {topGenres[1]
                      ? ` — add ${topGenres[1].genre} and that\u2019s ${topGenres[0].share + topGenres[1].share}%`
                      : "."}
                  </p>
                </div>
              </ScrollReveal>
            )}

            {artistRepItem && (
              <ScrollReveal delay={350}>
                <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-6">
                  <p className="text-4xl font-bold tabular-nums text-[var(--accent)] sm:text-5xl">
                    {Math.round(artistRepItem.score)}%
                  </p>
                  <p className="mt-2 text-[var(--text-soft)]">
                    of your listening weight goes to your top 5 artists.{" "}
                    {topArtists.length > 0 && (
                      <span className="text-[var(--text-muted)]">
                        ({topArtists.map((a) => a.name).join(", ")}
                        {topArtists.length < 5 ? "" : " and more"})
                      </span>
                    )}
                  </p>
                </div>
              </ScrollReveal>
            )}

            {temporalItem && (
              <ScrollReveal delay={450}>
                <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-6">
                  <p className="text-4xl font-bold tabular-nums text-[var(--accent)] sm:text-5xl">
                    {Math.round(temporalItem.score)}%
                  </p>
                  <p className="mt-2 text-[var(--text-soft)]">
                    similarity between your recent taste and your all-time taste.{" "}
                    {temporalItem.score >= 70
                      ? "You\u2019re looping."
                      : temporalItem.score >= 45
                        ? "Your taste has shifted somewhat over time."
                        : "Your taste has changed meaningfully \u2014 something opened up."}
                  </p>
                </div>
              </ScrollReveal>
            )}
          </div>

          {/* Sub-score breakdown */}
          <ScrollReveal delay={550}>
            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
              <p className="eyebrow">Score breakdown</p>
              <div className="space-y-5 pt-2">
                {score.breakdown.map((item) => (
                  <SubScoreBar
                    key={item.key}
                    label={item.label}
                    score={item.score}
                    weight={item.weight}
                  />
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={650}>
            <p className="text-xl leading-relaxed text-[var(--text-soft)]">
              This is the portrait of a listener being guided — not by malice,
              but by a system optimizing for engagement. It works by narrowing the
              aperture, one recommendation at a time.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Chapter 3: What the Industry Did ─────────────────────── */}
      <section
        id="ch-3"
        className="flex min-h-screen flex-col justify-center border-t border-white/6 px-5 py-32 sm:px-8"
      >
        <div className="mx-auto w-full max-w-2xl space-y-12">
          <ScrollReveal>
            <p className="eyebrow text-[var(--accent)]">Chapter III</p>
            <h2 className="mt-3 text-4xl font-bold text-[var(--text-strong)] sm:text-5xl">
              What the Industry Did
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <p className="text-xl leading-relaxed text-[var(--text-soft)]">
              Your bubble didn&apos;t form in a vacuum. While you were listening, the
              music was changing — engineered to perform inside the same
              algorithm that was shaping your taste.
            </p>
          </ScrollReveal>

          {/* 3 industry facts */}
          <div className="space-y-5">
            <ScrollReveal delay={200}>
              <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-6">
                <div className="flex items-baseline gap-4 flex-wrap">
                  <div>
                    <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                      {peakEntry.year}
                    </p>
                    <p className="text-5xl font-bold tabular-nums text-[var(--text-strong)]">
                      {peakEntry.avgDurationMinutes.toFixed(1)}
                      <span className="ml-1 text-2xl font-normal text-[var(--text-muted)]">
                        min
                      </span>
                    </p>
                  </div>
                  <div className="text-3xl text-[var(--text-muted)]">&#8594;</div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                      {latestSongLength.year}
                    </p>
                    <p className="text-5xl font-bold tabular-nums text-[var(--accent)]">
                      {latestSongLength.avgDurationMinutes.toFixed(1)}
                      <span className="ml-1 text-2xl font-normal text-[var(--text-muted)]">
                        min
                      </span>
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-[var(--text-soft)]">
                  Average hit song length. Streaming platforms pay per stream, not
                  per minute — so shorter songs mean more streams per listener hour.
                  The industry responded.
                </p>
                <p className="mt-3 text-sm text-[var(--text-muted)]">
                  Your average:{" "}
                  <span className={userMinutes < latestSongLength.avgDurationMinutes ? "text-[var(--accent)]" : "text-[var(--text-strong)]"}>
                    {userDurationLabel}
                  </span>{" "}
                  — {userVsAvg} the 2024 average.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-6">
                <p className="text-5xl font-bold tabular-nums text-[var(--accent)]">
                  {popHipHop}%
                </p>
                <p className="mt-3 text-[var(--text-soft)]">
                  of global chart streams go to Pop and Hip-Hop in 2024 — up from
                  less than a third in 1990. Genre diversity in mainstream music
                  has been collapsing for three decades.
                </p>
                {topGenres[0] && (
                  <p className="mt-3 text-sm text-[var(--text-muted)]">
                    Your dominant genre ({topGenres[0].genre} at{" "}
                    {topGenres[0].share}%) reflects the same concentration dynamic.
                  </p>
                )}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-6">
                <div className="flex items-baseline gap-4 flex-wrap">
                  <div>
                    <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                      {earliest.year}
                    </p>
                    <p className="text-5xl font-bold tabular-nums text-[var(--text-strong)]">
                      {earliest.artistsForHalfOfStreams}
                    </p>
                  </div>
                  <div className="text-3xl text-[var(--text-muted)]">&#8594;</div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                      {latest.year}
                    </p>
                    <p className="text-5xl font-bold tabular-nums text-[var(--accent)]">
                      {latest.artistsForHalfOfStreams}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-[var(--text-soft)]">
                  Artists needed to account for 50% of all streams. The music
                  economy is concentrating as fast as the listening is.
                </p>
              </div>
            </ScrollReveal>
          </div>

          {/* IMI personal bridge */}
          {imiAgg.totalTracks > 0 && (
            <ScrollReveal delay={480}>
              <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-6">
                <p className="eyebrow text-[var(--accent)]">Your listening</p>
                <p className="mt-3 text-5xl font-bold tabular-nums text-[var(--accent)]">
                  {imiAgg.engineeredCount}
                  <span className="ml-2 text-2xl font-normal text-[var(--text-muted)]">
                    of {imiAgg.totalTracks}
                  </span>
                </p>
                <p className="mt-3 text-[var(--text-soft)]">
                  of your top tracks score {IMI_ENGINEERED_THRESHOLD}+ on the
                  Industry Manipulation Index — algorithmically engineered for the
                  streaming era.{" "}
                  {imiAgg.engineeredPercent >= 50
                    ? "More than half your listening is optimized music."
                    : imiAgg.engineeredCount === 0
                      ? "Your taste skews toward less-optimized music."
                      : "A significant slice of your listening is platform-optimized."}
                </p>
                <p className="mt-3 text-sm text-[var(--text-muted)]">
                  IMI measures song length vs. era average, popularity, collaborations,
                  and release recency. See the full breakdown on the Dashboard.
                </p>
              </div>
            </ScrollReveal>
          )}

          <ScrollReveal delay={580}>
            <p className="text-xl leading-relaxed text-[var(--text-soft)]">
              These aren&apos;t accidents. Songs are shorter because short songs perform
              better. Genres are concentrating because the algorithm amplifies
              what&apos;s already working. Your listening is a response to an
              environment that was deliberately shaped — and is shaping you in
              turn.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Chapter 4: What You're Missing ───────────────────────── */}
      <section
        id="ch-4"
        className="flex min-h-screen flex-col justify-center border-t border-white/6 px-5 py-32 sm:px-8"
      >
        <div className="mx-auto w-full max-w-2xl space-y-12">
          <ScrollReveal>
            <p className="eyebrow text-[var(--accent)]">Chapter IV</p>
            <h2 className="mt-3 text-4xl font-bold text-[var(--text-strong)] sm:text-5xl">
              What You&apos;re Missing
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <p className="text-xl leading-relaxed text-[var(--text-soft)]">
              Your bubble has a shape. The algorithm isn&apos;t filtering out bad
              music — it&apos;s filtering out music you&apos;ve never been exposed to. That
              distinction matters.
            </p>
          </ScrollReveal>

          {/* Genre gap visualization */}
          {gapGenres.length > 0 && (
            <ScrollReveal delay={200}>
              <div className="space-y-4">
                <p className="text-sm text-[var(--text-muted)]">
                  Based on your listening profile, these genres are largely absent:
                </p>
                <div className="flex flex-wrap gap-2">
                  {gapGenres.map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm capitalize text-[var(--text-soft)]"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          )}

          <ScrollReveal delay={300}>
            <p className="text-xl leading-relaxed text-[var(--text-soft)]">
              Each of these represents a listening world the algorithm has been
              filtering out — not because you&apos;d dislike it, but because it
              hasn&apos;t been optimized to surface it to you.
            </p>
          </ScrollReveal>

          {/* Escape rec preview */}
          {recs4.length > 0 ? (
            <ScrollReveal delay={400}>
              <div className="space-y-4">
                <p className="text-sm text-[var(--text-muted)]">
                  Artists the algorithm has been filtering out of your recommendations:
                </p>
                <div className="space-y-3">
                  {recs4.map((rec) => (
                    <ArtistCard key={rec.artist.id} rec={rec} />
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ) : (
            <ScrollReveal delay={400}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 text-center space-y-3">
                <p className="text-[var(--text-soft)]">
                  Visit the Escape page to discover what the algorithm has been filtering out.
                </p>
                <Link
                  href="/escape"
                  className="button-secondary inline-flex text-sm px-5 py-2.5"
                >
                  Find your blind spots &#8594;
                </Link>
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* ── Chapter 5: What to Do About It ───────────────────────── */}
      <section
        id="ch-5"
        className="flex min-h-screen flex-col justify-center border-t border-white/6 px-5 py-32 sm:px-8"
      >
        <div className="mx-auto w-full max-w-2xl space-y-12">
          <ScrollReveal>
            <p className="eyebrow text-[var(--accent)]">Chapter V</p>
            <h2 className="mt-3 text-4xl font-bold text-[var(--text-strong)] sm:text-5xl">
              What to Do About It
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <p className="text-xl leading-relaxed text-[var(--text-soft)]">
              The algorithm narrows. You don&apos;t have to.
            </p>
          </ScrollReveal>

          {recs5.length > 0 && (
            <ScrollReveal delay={200}>
              <div className="space-y-3">
                {recs5.map((rec) => (
                  <ArtistCard key={rec.artist.id} rec={rec} />
                ))}
              </div>
            </ScrollReveal>
          )}

          {/* CTAs */}
          <ScrollReveal delay={300}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                href="/escape"
                className="flex flex-col gap-2 rounded-2xl border border-white/15 bg-white/[0.03] p-5 transition-colors hover:border-orange-500/30 hover:bg-white/[0.05]"
              >
                <p className="font-semibold text-[var(--text-strong)]">
                  Explore your escape route
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  Curated artists filtered out of your recommendations — with
                  anti-algorithm scores.
                </p>
                <p className="mt-auto text-sm text-[var(--accent)]">
                  Escape the Bubble &#8594;
                </p>
              </Link>

              <Link
                href="/compare"
                className="flex flex-col gap-2 rounded-2xl border border-white/15 bg-white/[0.03] p-5 transition-colors hover:border-sky-400/30 hover:bg-white/[0.05]"
              >
                <p className="font-semibold text-[var(--text-strong)]">
                  Compare with a friend
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  Who&apos;s more algorithmically captured? Share a link and find out.
                </p>
                <p className="mt-auto text-sm text-[var(--accent-cool)]">
                  Compare bubbles &#8594;
                </p>
              </Link>
            </div>
          </ScrollReveal>

          {/* Closing statement */}
          <ScrollReveal delay={450}>
            <div className="border-t border-white/8 pt-10 text-center space-y-4">
              <p className="text-2xl font-semibold text-[var(--text-strong)] sm:text-3xl">
                Spotify tracks what you listen to.
              </p>
              <p className="text-2xl font-semibold text-[var(--accent)] sm:text-3xl">
                Unwrapped tracks what you haven&apos;t.
              </p>

              <div className="pt-4 flex flex-wrap justify-center gap-3">
                <Link href="/dashboard" className="button-secondary text-sm px-5 py-2.5">
                  &#8592; Back to dashboard
                </Link>
                {usingDemoData && (
                  <Link href="/api/auth/login" className="button-primary text-sm px-5 py-2.5">
                    Log in to see your real story
                  </Link>
                )}
              </div>

              <p className="pt-2 text-xs text-[var(--text-muted)]">
                Scores are computed from your Spotify listening data using public
                metadata only. Organic/algorithmic split is inferred, not measured.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
