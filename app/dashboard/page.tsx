import Link from "next/link";

import { GenreDistributionChart } from "@/components/visualizations/genre-distribution-chart";
import { MacroTrendChart } from "@/components/visualizations/macro-trend-chart";
import { computeBubbleScore } from "@/lib/analysis/bubble-score";
import {
  genreShareTrend,
  macroSources,
  popularityConcentrationTrend,
  songLengthTrend,
} from "@/lib/data/macro-trends";
import { formatDuration, formatNumber, formatPercent } from "@/lib/format";
import { getCurrentSpotifyProfile } from "@/lib/spotify/current-profile";
export default async function DashboardPage() {
  const { profile, usingDemoData, isAuthenticated } = await getCurrentSpotifyProfile();
  const score = computeBubbleScore(profile, "medium_term");
  const shareHref = usingDemoData ? "/share/demo-user" : `/share/${profile.userId}`;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
      <section className="panel flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Data source</p>
          <h2 className="text-2xl font-semibold text-[var(--text-strong)]">
            {usingDemoData ? "Demo profile is active" : "Live Spotify profile is active"}
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
            {usingDemoData
              ? "You are viewing the seeded fallback profile. Use Spotify login once your app and Supabase project are fully configured."
              : profile.fetchedFromCache
                ? "This dashboard loaded from the 24-hour Supabase cache instead of hitting Spotify again."
                : "This dashboard loaded directly from Spotify and refreshed the cache."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {isAuthenticated ? (
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="button-secondary">
                Log out
              </button>
            </form>
          ) : (
            <Link href="/api/auth/login" className="button-primary">
              Log in with Spotify
            </Link>
          )}
          <Link href="/setup" className="button-secondary">
            Setup checklist
          </Link>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="panel panel-glow flex flex-col gap-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="eyebrow">{usingDemoData ? "v1 dashboard preview" : "v1 live dashboard"}</p>
              <h1 className="text-4xl font-semibold tracking-tight text-[var(--text-strong)] sm:text-5xl">
                {profile.displayName}, your listening isn&apos;t neutral.
              </h1>
            </div>
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 text-sm">
              <span className="rounded-full bg-[var(--accent)] px-4 py-2 font-medium text-black">
                6 months
              </span>
              <span className="px-4 py-2 text-[var(--text-muted)]">4 weeks</span>
              <span className="px-4 py-2 text-[var(--text-muted)]">all time</span>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-[0.8fr_1.2fr]">
            <div className="flex min-h-72 flex-col justify-between rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.28),_transparent_58%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-6">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-[var(--text-muted)]">
                  Filter Bubble Score
                </p>
                <div className="mt-6 text-7xl font-semibold leading-none text-[var(--text-strong)]">
                  {Math.round(score.score)}
                </div>
                <p className="mt-3 text-xl text-[var(--text-strong)]">{score.tier}</p>
                <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--text-muted)]">
                  Higher means your taste is converging around a tighter, more
                  repeatedly reinforced set of genres and artists.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
                    Organic
                  </p>
                  <p className="mt-2 text-2xl font-medium text-[var(--text-strong)]">
                    {formatPercent(score.organicRatio)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
                    Estimated algorithmic
                  </p>
                  <p className="mt-2 text-2xl font-medium text-[var(--text-strong)]">
                    {formatPercent(score.algorithmicRatio)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {score.breakdown.map((item) => (
                <article key={item.key} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-medium text-[var(--text-strong)]">{item.label}</h2>
                    <span className="text-2xl font-semibold text-[var(--text-strong)]">
                      {Math.round(item.score)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--text-soft)]">
                    Weight {(item.weight * 100).toFixed(0)}%
                  </p>
                  <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">{item.explanation}</p>
                </article>
              ))}
            </div>
          </div>
        </div>

        <aside className="panel flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Listening at a glance</p>
              <h2 className="text-2xl font-semibold text-[var(--text-strong)]">What shapes the score</h2>
            </div>
            <Link href={shareHref} className="button-secondary">
              {usingDemoData ? "Share preview" : "Share route"}
            </Link>
          </div>

          <div className="grid gap-3">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm text-[var(--text-muted)]">Top genre share</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--text-strong)]">
                {formatPercent(score.primaryGenre.share)}
              </p>
              <p className="mt-1 text-sm text-[var(--text-soft)]">
                {score.primaryGenre.name} dominates your medium-term profile.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm text-[var(--text-muted)]">Average track length</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--text-strong)]">
                {formatDuration(score.averageTrackDurationMs)}
              </p>
              <p className="mt-1 text-sm text-[var(--text-soft)]">
                Shorter than the 2005 chart average, slightly under the 2024 norm.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm text-[var(--text-muted)]">Saved tracks</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--text-strong)]">
                {formatNumber(profile.savedTrackCount)}
              </p>
              <p className="mt-1 text-sm text-[var(--text-soft)]">
                Useful later for contrasting active choosing against passive discovery.
              </p>
            </div>
          </div>
        </aside>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.95fr]">
        <article className="panel">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Genre footprint</p>
              <h2 className="text-2xl font-semibold text-[var(--text-strong)]">Your taste clusters hard</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <GenreDistributionChart data={score.genreDistribution} />
            <div className="space-y-3">
              {score.genreDistribution.slice(0, 8).map((genre) => (
                <div
                  key={genre.genre}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <span className="capitalize text-[var(--text-strong)]">{genre.genre}</span>
                  <span className="font-medium text-[var(--text-soft)]">{formatPercent(genre.share)}</span>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="panel">
          <p className="eyebrow">Top artists</p>
          <h2 className="text-2xl font-semibold text-[var(--text-strong)]">The people you keep returning to</h2>
          <div className="mt-6 space-y-3">
            {profile.timeRanges.medium_term.topArtists.map((artist, index) => (
              <div
                key={artist.id}
                className="flex items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-sm text-[var(--text-muted)]">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <p className="text-lg font-medium text-[var(--text-strong)]">{artist.name}</p>
                    <p className="text-sm text-[var(--text-muted)]">
                      {(artist.genres?.length ? artist.genres.slice(0, 2) : ["unknown genre"]).join(" · ")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[var(--text-muted)]">
                    {formatNumber(artist.followers)} followers
                  </p>
                  <p className="text-sm text-[var(--text-soft)]">Popularity {artist.popularity}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel">
        <p className="eyebrow">Top tracks</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--text-strong)]">The songs carrying your profile</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--text-muted)]">
              This grid stays intentionally concrete: cover, artist, duration, popularity. The argument only works if the score stays traceable.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {profile.timeRanges.medium_term.topTracks.map((track) => (
            <article key={track.id} className="rounded-[26px] border border-white/10 bg-white/[0.03] p-4">
              <div className="aspect-square rounded-[20px] bg-[linear-gradient(135deg,rgba(249,115,22,0.4),rgba(56,189,248,0.16))]" />
              <h3 className="mt-4 text-lg font-medium text-[var(--text-strong)]">{track.name}</h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{track.artists.join(", ")}</p>
              <div className="mt-4 flex items-center justify-between text-sm text-[var(--text-soft)]">
                <span>{formatDuration(track.durationMs)}</span>
                <span>Popularity {track.popularity}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-cool))]"
                  style={{ width: `${track.popularity}%` }}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="panel">
          <p className="eyebrow">Macro trend 01</p>
          <h2 className="text-2xl font-semibold text-[var(--text-strong)]">Songs got shorter. Yours did too.</h2>
          <MacroTrendChart
            type="area"
            data={songLengthTrend}
            xKey="year"
            yKeys={[{ key: "avgDurationMinutes", label: "Average hit length", color: "#f97316" }]}
            yAxisLabel="Minutes"
          />
          <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
            Your average track is {formatDuration(score.averageTrackDurationMs)}. The 2024 chart average in this dataset is 3:00. In 2005, it was about 4:06.
          </p>
        </article>

        <article className="panel">
          <p className="eyebrow">Macro trend 02</p>
          <h2 className="text-2xl font-semibold text-[var(--text-strong)]">Genre share keeps compressing</h2>
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
          <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
            Your top genre accounts for {formatPercent(score.primaryGenre.share)} of your listening. This is the personal version of the same concentration story.
          </p>
        </article>

        <article className="panel">
          <p className="eyebrow">Macro trend 03</p>
          <h2 className="text-2xl font-semibold text-[var(--text-strong)]">Fewer artists capture more attention</h2>
          <MacroTrendChart
            type="line"
            data={popularityConcentrationTrend}
            xKey="year"
            yKeys={[
              {
                key: "artistsForHalfOfStreams",
                label: "Artists needed for 50% of streams",
                color: "#38bdf8",
              },
            ]}
            yAxisLabel="Artists"
          />
          <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
            Your top five artists dominate the score because the wider market also keeps consolidating around fewer repeat winners.
          </p>
        </article>
      </section>

      <section className="panel flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Sources and honesty</p>
          <h2 className="text-2xl font-semibold text-[var(--text-strong)]">What this preview proves, and what it doesn&apos;t</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-muted)]">
            The listening split is inferred, not measured. The score is explanatory, not diagnostic. Macro data here is seeded for the first build slice and will be replaced with cited static datasets in the next pass.
          </p>
        </div>
        <ul className="space-y-2 text-sm text-[var(--text-soft)]">
          {macroSources.map((source) => (
            <li key={source}>{source}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
