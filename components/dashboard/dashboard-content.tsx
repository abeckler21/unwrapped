"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { GenreDistributionChart } from "@/components/visualizations/genre-distribution-chart";
import { ListeningProfileChart } from "@/components/visualizations/listening-profile-chart";
import { MacroTrendChart } from "@/components/visualizations/macro-trend-chart";
import { ShareActions } from "@/components/dashboard/share-actions";
import { InsightShareButton } from "@/components/dashboard/insight-share-button";
import {
  genreShareTrend,
  macroSources,
  popularityConcentrationTrend,
  songLengthTrend,
} from "@/lib/data/macro-trends";
import { formatDuration, formatPercent } from "@/lib/format";
import { computeListeningProfile, ALGORITHMIC_ARCHETYPE } from "@/lib/analysis/listening-profile";
import { computeTrackIMI, computeIMIAggregate, imiTierBg, IMI_ENGINEERED_THRESHOLD } from "@/lib/analysis/imi"
import type { IMIResult } from "@/lib/analysis/imi";
import type { BubbleScoreResult, ScoreBreakdownItem } from "@/lib/analysis/bubble-score";
import type { SpotifyProfile, SpotifyTrack, TimeRange } from "@/lib/types/spotify";

const TIME_RANGES: TimeRange[] = ["short_term", "medium_term", "long_term"];

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  short_term: "Recent",
  medium_term: "6 months",
  long_term: "All time",
};

const BREAKDOWN_CONTEXT: Record<ScoreBreakdownItem["key"], string> = {
  genreConcentration: "High = narrower genre mix",
  artistRepetition: "High = same artists repeat",
  popularitySkew: "High = more mainstream",
  temporalConsistency: "High = taste is looping",
};

type Props = {
  profile: SpotifyProfile;
  usingDemoData: boolean;
  initialRange: TimeRange;
  scoresByRange: Record<TimeRange, BubbleScoreResult>;
  shareHref: string;
};

export function DashboardContent({
  profile,
  usingDemoData,
  initialRange,
  scoresByRange,
  shareHref,
}: Props) {
  const [range, setRange] = useState(initialRange);
  const score = scoresByRange[range];
  const currentData = profile.timeRanges[range];

  function selectRange(nextRange: TimeRange) {
    setRange(nextRange);

    const url = new URL(window.location.href);
    url.searchParams.set("range", nextRange);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  const listeningProfile = computeListeningProfile(profile, range);

  return (
    <div className="flex flex-col gap-10">

      {/* ── Toggle ──────────────────────────────────────────────── */}
      <div className="flex justify-center">
        <div className="flex flex-col items-center gap-2">
          <p className="eyebrow">Listening window</p>
          <div className="flex rounded-full border border-white/10 bg-white/[0.04] p-1">
            {TIME_RANGES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => selectRange(r)}
                aria-pressed={r === range}
                className={
                  r === range
                    ? "rounded-full bg-[var(--accent)] px-6 py-2 text-sm font-semibold text-black"
                    : "px-6 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)]"
                }
              >
                {TIME_RANGE_LABELS[r]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Score hero ──────────────────────────────────────────── */}
      <section className="grid gap-5 lg:grid-cols-[1fr_272px]">

        {/* Left: big number + stats */}
        <div className="panel panel-glow flex flex-col gap-8 p-8 sm:p-10">
          <div>
            <p className="eyebrow">
              {profile.displayName} &middot; {TIME_RANGE_LABELS[range]}
            </p>
            <div className="mt-3 flex flex-wrap items-end gap-4">
              <span
                className="font-semibold leading-none tabular-nums text-[var(--text-strong)]"
                style={{ fontSize: "clamp(5rem, 18vw, 8rem)" }}
              >
                {Math.round(score.score)}
              </span>
              <div className="pb-2">
                <p className="text-2xl font-medium text-[var(--accent)]">{score.tier}</p>
                <p className="mt-0.5 text-sm text-[var(--text-muted)]">out of 100</p>
              </div>
            </div>
            <p className="mt-4 max-w-lg text-sm leading-7 text-[var(--text-muted)]">
              Higher means your taste is converging around the same genres and artists on repeat.
              The algorithm feeds you more of what you already play, narrowing the field over time.
            </p>
            {!usingDemoData && (
              <div className="mt-4">
                <InsightShareButton href={`${shareHref}/bubble`} label="Share score" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Organic</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--text-strong)]">
                {formatPercent(score.organicRatio)}
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">estimated</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Algorithmic</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--text-strong)]">
                {formatPercent(score.algorithmicRatio)}
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">inferred</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Avg. track</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--text-strong)]">
                {formatDuration(score.averageTrackDurationMs)}
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">vs 4:06 in 2005</p>
            </div>
          </div>
        </div>

        {/* Right: sub-scores + share */}
        <div className="flex flex-col gap-3">
          {score.breakdown.map((item) => (
            <div key={item.key} className="panel flex items-center gap-4 px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--text-strong)]">{item.label}</p>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                  {(item.weight * 100).toFixed(0)}% of score
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {BREAKDOWN_CONTEXT[item.key]}
                </p>
              </div>
              <span className="text-xl font-semibold tabular-nums text-[var(--text-strong)]">
                {Math.round(item.score)}
              </span>
            </div>
          ))}
          <ShareActions shareHref={shareHref} />
        </div>
      </section>

      {/* ── Genre + Artists ─────────────────────────────────────── */}
      <section className="grid gap-5 lg:grid-cols-2">

        <article className="panel flex flex-col gap-5">
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="eyebrow">Genre footprint</p>
              {!usingDemoData && score.hasGenreMetadata && (
                <InsightShareButton href={`${shareHref}/fingerprint`} label="Share" />
              )}
            </div>
            <h2 className="mt-1 text-lg font-semibold text-[var(--text-strong)]">Your taste, mapped</h2>
          </div>

          {score.hasGenreMetadata ? (
            <>
              <GenreDistributionChart data={score.genreDistribution} />
              <div className="flex flex-col gap-2">
                {score.genreDistribution.slice(0, 7).map((genre, i) => (
                  <div key={genre.genre} className="flex items-center gap-3">
                    <span className="w-4 shrink-0 text-right text-xs tabular-nums text-[var(--text-muted)]">
                      {i + 1}
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-[var(--accent)]"
                        style={{ width: `${genre.share}%`, opacity: i === 0 ? 1 : 0.55 }}
                      />
                    </div>
                    <span className="w-36 truncate text-xs capitalize text-[var(--text-soft)]">
                      {genre.genre}
                    </span>
                    <span className="w-9 shrink-0 text-right text-xs tabular-nums text-[var(--text-muted)]">
                      {formatPercent(genre.share)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm leading-7 text-[var(--text-muted)]">
              Spotify returned your top artists without genre metadata for this time range.
              Genre analysis is unavailable.
            </p>
          )}
        </article>

        <article className="panel flex flex-col gap-5">
          <div>
            <p className="eyebrow">Top artists &middot; {TIME_RANGE_LABELS[range]}</p>
            <h2 className="mt-1 text-lg font-semibold text-[var(--text-strong)]">
              Who you keep returning to
            </h2>
          </div>

          <div className="flex flex-col gap-0.5">
            {currentData.topArtists.slice(0, 10).map((artist, index) => (
              <Link
                key={artist.id}
                href={`/artist/${artist.id}`}
                className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.04]"
              >
                <span className="w-5 shrink-0 text-right text-xs tabular-nums text-[var(--text-muted)]">
                  {index + 1}
                </span>
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/[0.06]">
                  {artist.images[0]?.url && (
                    <Image
                      src={artist.images[0].url}
                      alt={artist.name}
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--text-strong)]">
                    {artist.name}
                  </p>
                  <p className="truncate text-xs text-[var(--text-muted)]">
                    {artist.genres?.length
                      ? artist.genres.slice(0, 2).join(" · ")
                      : "genre unavailable"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </article>
      </section>

      {/* ── Top tracks + IMI ────────────────────────────────────── */}
      <section className="panel flex flex-col gap-5">
        {/* Section header + IMI aggregate */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="eyebrow">Top tracks &middot; {TIME_RANGE_LABELS[range]}</p>
            <h2 className="mt-1 text-lg font-semibold text-[var(--text-strong)]">
              The songs carrying your profile
            </h2>
          </div>

          {/* IMI aggregate callout */}
          {(() => {
            const agg = computeIMIAggregate(currentData.topTracks)
            const engineeredLabel = agg.engineeredCount === 0
              ? "None of your top tracks score above the engineered threshold."
              : `${agg.engineeredCount} of your top ${agg.totalTracks} tracks score ${IMI_ENGINEERED_THRESHOLD}+ on the IMI.`
            return (
              <div className="shrink-0 rounded-2xl border border-white/10 bg-black/20 px-5 py-4 sm:text-right">
                <p className="eyebrow">Industry Manipulation Index</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--accent)]">
                  {agg.mean}
                  <span className="ml-1 text-sm font-normal text-[var(--text-muted)]">avg</span>
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">{engineeredLabel}</p>
              </div>
            )
          })()}
        </div>

        {/* Column labels */}
        <div className="flex items-center gap-3 border-b border-white/6 pb-2 px-2">
          <span className="w-5 shrink-0" />
          <span className="w-9 shrink-0" />
          <span className="flex-1 text-xs text-[var(--text-muted)]">Track</span>
          <span className="shrink-0 text-xs text-[var(--text-muted)]">Length</span>
          <span className="hidden w-24 shrink-0 text-right text-xs text-[var(--text-muted)] sm:block">IMI</span>
        </div>

        <div className="flex flex-col gap-0.5">
          {currentData.topTracks.map((track, index) => {
            const imi = computeTrackIMI(track)
            return (
              <IMITrackRow key={track.id} track={track} index={index} imi={imi} />
            )
          })}
        </div>

        {/* IMI methodology note */}
        <p className="border-t border-white/6 pt-3 text-xs text-[var(--text-muted)]">
          IMI = Industry Manipulation Index. Scores how algorithmically optimized each track is
          for the streaming era, based on song length, popularity, features, recency, and how short
          the track is relative to its era&apos;s average hit. Higher = more engineered for the platform.
          Engineered threshold: {IMI_ENGINEERED_THRESHOLD}+.
        </p>
      </section>

      {/* ── Listening Profile ───────────────────────────────────── */}
      <section className="panel flex flex-col gap-5 p-6 sm:p-8">
        <div>
          <p className="eyebrow">Listening Profile</p>
          <h2 className="mt-1 text-lg font-semibold text-[var(--text-strong)]">
            Your sound vs. the algorithm&apos;s ideal
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            How the shape of your listening compares to the algorithm&apos;s ideal — based on
            song lengths, release dates, and genre breadth.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-8">
          <ListeningProfileChart
            profile={listeningProfile}
            comparison={ALGORITHMIC_ARCHETYPE}
            comparisonLabel="Algorithm's ideal"
          />

          <div className="flex w-full flex-1 flex-col gap-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Avg song</p>
                <p className="mt-1.5 text-xl font-semibold tabular-nums text-[var(--text-strong)]">
                  {formatDuration(listeningProfile.meanDurationMs)}
                </p>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">brevity signal</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Recent releases</p>
                <p className="mt-1.5 text-xl font-semibold tabular-nums text-[var(--text-strong)]">
                  {formatPercent(listeningProfile.recentPercent)}
                </p>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">last 2 years</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Genre HHI</p>
                <p className="mt-1.5 text-xl font-semibold tabular-nums text-[var(--text-strong)]">
                  {listeningProfile.genreHHI.toFixed(2)}
                </p>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">1.0 = one genre</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Top 3 artists</p>
                <p className="mt-1.5 text-xl font-semibold tabular-nums text-[var(--text-strong)]">
                  {formatPercent(listeningProfile.topThreeArtistWeightPercent)}
                </p>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">of listening weight</p>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Based on your top {listeningProfile.trackCount} tracks.
            </p>
          </div>
        </div>
      </section>

      {/* ── Macro trends ────────────────────────────────────────── */}
      <section className="flex flex-col gap-5">
        <div>
          <p className="eyebrow">Industry context</p>
          <h2 className="mt-1 text-lg font-semibold text-[var(--text-strong)]">
            Your data in the macro picture
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Industry-wide trends — each callout connects to your profile.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <article className="panel flex flex-col gap-4">
            <div>
              <p className="eyebrow" style={{ fontSize: "0.65rem" }}>Trend 01</p>
              <h3 className="mt-1 text-base font-semibold text-[var(--text-strong)]">Songs got shorter</h3>
            </div>
            <MacroTrendChart
              type="area"
              data={songLengthTrend}
              xKey="year"
              yKeys={[{ key: "avgDurationMinutes", label: "Avg. hit length", color: "#f97316" }]}
              yAxisLabel="Minutes"
            />
            <p className="text-sm leading-6 text-[var(--text-muted)]">
              Your avg. track:{" "}
              <span className="text-[var(--text-soft)]">{formatDuration(score.averageTrackDurationMs)}</span>
              . Chart avg. is 3:00 in 2024, vs 4:06 in 2005.
            </p>
          </article>

          <article className="panel flex flex-col gap-4">
            <div>
              <p className="eyebrow" style={{ fontSize: "0.65rem" }}>Trend 02</p>
              <h3 className="mt-1 text-base font-semibold text-[var(--text-strong)]">
                Genre share compressed
              </h3>
            </div>
            <MacroTrendChart
              type="stacked-bar"
              data={genreShareTrend}
              xKey="year"
              yKeys={[
                { key: "pop", label: "Pop", color: "#f97316" },
                { key: "hipHop", label: "Hip-Hop", color: "#fb7185" },
                { key: "rock", label: "Rock", color: "#38bdf8" },
                { key: "dance", label: "Dance", color: "#22c55e" },
                { key: "country", label: "Country", color: "#eab308" },
                { key: "latin", label: "Latin", color: "#a855f7" },
                { key: "rnb", label: "R&B", color: "#14b8a6" },
              ]}
              yAxisLabel="Share"
            />
            <p className="text-sm leading-6 text-[var(--text-muted)]">
              {score.hasGenreMetadata
                ? `Your top genre: ${formatPercent(score.primaryGenre.share)} of your listening — same concentration dynamic at personal scale.`
                : "Genre metadata unavailable. The macro trend holds regardless."}
            </p>
          </article>

          <article className="panel flex flex-col gap-4">
            <div>
              <p className="eyebrow" style={{ fontSize: "0.65rem" }}>Trend 03</p>
              <h3 className="mt-1 text-base font-semibold text-[var(--text-strong)]">
                Fewer artists, more streams
              </h3>
            </div>
            <MacroTrendChart
              type="line"
              data={popularityConcentrationTrend}
              xKey="year"
              yKeys={[
                {
                  key: "artistsForHalfOfStreams",
                  label: "Artists for 50% of streams",
                  color: "#38bdf8",
                },
              ]}
              yAxisLabel="Artists"
            />
            <p className="text-sm leading-6 text-[var(--text-muted)]">
              Your top 5 artists dominate your score — mirroring a market consolidating around
              fewer repeat winners.
            </p>
          </article>
        </div>
      </section>

      {/* ── Sources ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 border-t border-white/[0.08] pt-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">Honesty note</p>
          <p className="mt-2 max-w-lg text-sm leading-7 text-[var(--text-muted)]">
            The organic/algorithmic split is inferred from playlist names and popularity signals —
            not measured directly. The score is explanatory, not diagnostic. Macro trends are
            preloaded from the source set listed here and should be read as directional context.
          </p>
        </div>
        <ul className="shrink-0 space-y-1 text-xs text-[var(--text-muted)]">
          {macroSources.map((source) => (
            <li key={source}>{source}</li>
          ))}
        </ul>
      </div>

    </div>
  );
}

// ── IMI track row with breakdown tooltip ──────────────────────────────────────

const IMI_LABELS: Record<keyof IMIResult["breakdown"], string> = {
  duration:     "Duration alignment",
  popularity:   "Popularity signal",
  collaboration:"Collaboration",
  recency:      "Recency bonus",
  eraDeviation: "Era deviation",
}

const IMI_MAX: Record<keyof IMIResult["breakdown"], number> = {
  duration: 30, popularity: 25, collaboration: 20, recency: 15, eraDeviation: 10,
}

function IMITrackRow({
  track,
  index,
  imi,
}: {
  track: SpotifyTrack
  index: number
  imi: IMIResult
}) {
  const [showTooltip, setShowTooltip] = useState(false)
  const desktopRef = useRef<HTMLDivElement>(null)
  const mobileRef = useRef<HTMLDivElement>(null)

  // Close tooltip when clicking/tapping outside both badge containers
  useEffect(() => {
    if (!showTooltip) return
    function handleOutsideClick(e: MouseEvent | TouchEvent) {
      const target = e.target as Node
      const insideDesktop = desktopRef.current?.contains(target)
      const insideMobile = mobileRef.current?.contains(target)
      if (!insideDesktop && !insideMobile) setShowTooltip(false)
    }
    document.addEventListener("mousedown", handleOutsideClick)
    document.addEventListener("touchstart", handleOutsideClick)
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
      document.removeEventListener("touchstart", handleOutsideClick)
    }
  }, [showTooltip])

  const breakdown = (
    <div className="absolute bottom-full right-0 z-50 mb-2 w-52 max-w-[calc(100vw-1rem)] rounded-xl border border-white/10 bg-[#111] p-3 shadow-xl">
      <p className="mb-2 text-xs font-semibold text-[var(--text-soft)]">IMI Breakdown</p>
      <div className="flex flex-col gap-1.5">
        {(Object.keys(imi.breakdown) as (keyof IMIResult["breakdown"])[]).map((key) => {
          const val = imi.breakdown[key]
          const max = IMI_MAX[key]
          return (
            <div key={key}>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-muted)]">{IMI_LABELS[key]}</span>
                <span className="tabular-nums text-[var(--text-soft)]">{val}/{max}</span>
              </div>
              <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-[var(--accent)]/60"
                  style={{ width: `${(val / max) * 100}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <p className="mt-2 text-[10px] text-[var(--text-muted)]">Total: {imi.score}/100</p>
    </div>
  )

  return (
    <div className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.04]">
      <span className="w-5 shrink-0 text-right text-xs tabular-nums text-[var(--text-muted)]">
        {index + 1}
      </span>
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border border-white/10 bg-white/[0.06]">
        {track.album.images[0]?.url && (
          <Image
            src={track.album.images[0].url}
            alt={track.album.name}
            fill
            sizes="36px"
            className="object-cover"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--text-strong)]">{track.name}</p>
        <p className="truncate text-xs text-[var(--text-muted)]">{track.artists.join(", ")}</p>
      </div>
      <span className="shrink-0 text-xs tabular-nums text-[var(--text-muted)]">
        {formatDuration(track.durationMs)}
      </span>
      {/* IMI badge — sm+ (hover + tap to toggle) */}
      <div ref={desktopRef} className="relative hidden w-24 shrink-0 items-center justify-end sm:flex">
        <button
          type="button"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          onClick={() => setShowTooltip((v) => !v)}
          aria-expanded={showTooltip}
          aria-label={`IMI breakdown for ${track.name}`}
          className={`rounded-full border px-2 py-0.5 text-xs font-medium tabular-nums ${imiTierBg(imi.tier)}`}
        >
          {imi.score} · {imi.tier}
        </button>
        {showTooltip && breakdown}
      </div>
      {/* IMI badge — mobile (tap to toggle) */}
      <div ref={mobileRef} className="relative flex w-8 shrink-0 items-center justify-end sm:hidden">
        <button
          type="button"
          onClick={() => setShowTooltip((v) => !v)}
          aria-expanded={showTooltip}
          aria-label={`IMI breakdown for ${track.name}`}
          className={`rounded-full border px-1.5 py-0.5 text-xs font-medium tabular-nums ${imiTierBg(imi.tier)}`}
        >
          {imi.score}
        </button>
        {showTooltip && breakdown}
      </div>
    </div>
  )
}
