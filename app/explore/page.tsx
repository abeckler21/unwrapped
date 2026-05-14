import { MacroTrendChart } from "@/components/visualizations/macro-trend-chart"
import { WorldGenreMapLoader } from "@/components/visualizations/world-genre-map-loader"
import { genreShareTrend } from "@/lib/data/macro-trends"

export const metadata = {
  title: "Global Music Explorer — Unwrapped",
  description:
    "See how genre dominance shifted across the world from 1990 to 2024. Explore the rise of K-Pop, Afrobeats, Latin, and Hip-Hop on a zoomable interactive world map.",
}

const GENRE_CHART_KEYS = [
  { key: "pop",    label: "Pop",     color: "#f97316" },
  { key: "hipHop", label: "Hip-Hop", color: "#a855f7" },
  { key: "rock",   label: "Rock",    color: "#ef4444" },
  { key: "dance",  label: "Electronic/Dance", color: "#38bdf8" },
  { key: "latin",  label: "Latin",   color: "#22c55e" },
  { key: "rnb",    label: "R&B",     color: "#eab308" },
]

export default function ExplorePage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-10 sm:px-8 lg:px-10">

      {/* Hero */}
      <div className="max-w-2xl">
        <p className="eyebrow">Global Music Explorer</p>
        <h1 className="mt-2 text-3xl font-bold text-[var(--text-strong)] sm:text-4xl">
          What You&rsquo;re Missing
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
          Spotify&rsquo;s algorithm optimises for your market. Here&rsquo;s what&rsquo;s
          happening everywhere else. Drag the year slider to watch genre dominance
          shift across 30+ countries from 1990 to 2024&nbsp;&mdash; the Afrobeats
          explosion, K-Pop&rsquo;s global reach, and Latin music&rsquo;s steady climb.
        </p>
      </div>

      {/* Context cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="panel p-5">
          <p className="text-2xl font-bold text-[var(--accent)]">3&times;</p>
          <p className="mt-1 text-sm font-medium text-[var(--text-strong)]">
            Afrobeats growth
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
            Nigerian Afrobeats went from a regional format to the fastest-growing
            genre globally between 2015 and 2024.
          </p>
        </div>
        <div className="panel p-5">
          <p className="text-2xl font-bold text-[var(--accent)]">62%</p>
          <p className="mt-1 text-sm font-medium text-[var(--text-strong)]">
            K-Pop&rsquo;s South Korean share
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
            K-Pop dominates 60&ndash;65% of South Korea&rsquo;s streaming market
            and has become the primary export genre since 2012.
          </p>
        </div>
        <div className="panel p-5">
          <p className="text-2xl font-bold text-[var(--accent)]">40%</p>
          <p className="mt-1 text-sm font-medium text-[var(--text-strong)]">
            Hip-Hop in France
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
            France has the highest per-capita hip-hop consumption in Europe. By
            2024 it accounts for 40% of all French streaming.
          </p>
        </div>
      </div>

      {/* Interactive map */}
      <section>
        <h2 className="mb-6 text-xl font-bold text-[var(--text-strong)]">
          Genre Dominance by Country
        </h2>
        <WorldGenreMapLoader />
      </section>

      {/* Global genre trend chart */}
      <section>
        <h2 className="mb-2 text-xl font-bold text-[var(--text-strong)]">
          Global Genre Share, 1990&ndash;2024
        </h2>
        <p className="mb-6 text-sm text-[var(--text-muted)]">
          US Billboard Hot 100 genre composition. The collapse of rock and the
          parallel rise of hip-hop and pop is the defining structural shift of
          the streaming era.
        </p>
        <div className="panel p-4 sm:p-6">
          <MacroTrendChart
            type="stacked-bar"
            data={genreShareTrend}
            xKey="year"
            yKeys={GENRE_CHART_KEYS}
            yAxisLabel="% of chart"
          />
        </div>
      </section>

      {/* Regional spotlights */}
      <section>
        <h2 className="mb-6 text-xl font-bold text-[var(--text-strong)]">
          Regional Spotlights
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SPOTLIGHTS.map((s) => (
            <div key={s.region} className="panel p-5">
              <div className="mb-3 flex items-center gap-3">
                <span
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-base"
                  style={{ background: s.color + "22", color: s.color }}
                >
                  {s.icon}
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: s.color }}>
                    {s.genre}
                  </p>
                  <p className="text-sm font-bold text-[var(--text-strong)]">{s.region}</p>
                </div>
              </div>
              <p className="text-xs leading-5 text-[var(--text-muted)]">{s.description}</p>
              <div className="mt-3 space-y-1">
                {s.milestones.map((m) => (
                  <div key={m.year} className="flex items-baseline gap-2">
                    <span className="text-xs font-mono text-[var(--accent)]">{m.year}</span>
                    <span className="text-xs text-[var(--text-muted)]">{m.event}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footnote */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-5 py-4">
        <p className="text-xs leading-6 text-[var(--text-muted)]">
          <span className="font-medium text-[var(--text-soft)]">Data sources: </span>
          IFPI Global Music Report, Billboard Hot 100 historical data, regional chart analyses.
          Country-level distributions are modeled from published genre share data and regional
          streaming reports. Marked &ldquo;est.&rdquo; where country-specific data is unavailable.
        </p>
      </div>
    </main>
  )
}

const SPOTLIGHTS = [
  {
    region: "West Africa",
    genre: "Afrobeats",
    icon: "🥁",
    color: "#f59e0b",
    description:
      "Nigeria&rsquos Afrobeats scene — Burna Boy, Wizkid, Davido — went from a Lagos club format to charting globally. By 2024, Afrobeats accounts for 65% of Nigerian streaming and is the dominant genre across Ghana, Senegal, and Ivory Coast.",
    milestones: [
      { year: 2012, event: "First Afrobeats crossover in UK charts" },
      { year: 2017, event: "Wizkid collaborates with Drake" },
      { year: 2021, event: "Burna Boy wins Grammy for Best Global Music Album" },
      { year: 2024, event: "Afrobeats is 3rd fastest-growing genre globally" },
    ],
  },
  {
    region: "East Asia",
    genre: "K-Pop",
    icon: "🎤",
    color: "#ec4899",
    description:
      "South Korea industrialised pop music into a precision product. K-Pop now dominates domestic streaming at 60%, drives cultural exports worth billions, and has reshaped fan culture in Japan, Southeast Asia, and the US.",
    milestones: [
      { year: 2008, event: "BIGBANG begins international expansion" },
      { year: 2012, event: "Gangnam Style — first YouTube video to 1B views" },
      { year: 2018, event: "BTS performs at UN General Assembly" },
      { year: 2024, event: "K-Pop accounts for 20% of Thai, Indonesian streaming" },
    ],
  },
  {
    region: "Latin America",
    genre: "Latin / Reggaeton",
    icon: "🎸",
    color: "#22c55e",
    description:
      "Latin music&rsquos global moment was built on reggaeton. Colombia&rsquos Medell\u00edn scene and Puerto Rico&rsquos reggaeton infrastructure fuelled a genre that now commands 45%+ across Mexico, Colombia, and Spain.",
    milestones: [
      { year: 2005, event: "Reggaeton enters US mainstream (Daddy Yankee, Gasolina)" },
      { year: 2017, event: "Despacito becomes most-streamed song in history" },
      { year: 2019, event: "Latin becomes largest non-English genre on Spotify" },
      { year: 2024, event: "Latin accounts for 46% of Spanish streaming" },
    ],
  },
  {
    region: "France",
    genre: "Hip-Hop",
    icon: "🎙",
    color: "#a855f7",
    description:
      "France has the largest hip-hop market in Europe. A rich tradition of French-language rap — from IAM and NTM in the 90s to PNL and Ninho today — means hip-hop accounts for 40% of domestic streaming in 2024.",
    milestones: [
      { year: 1990, event: "IAM and NTM pioneer French-language rap" },
      { year: 2004, event: "French hip-hop outsells French pop for first time" },
      { year: 2017, event: "PNL&rsquos Dans la L\u00e9gende sets streaming records" },
      { year: 2024, event: "France: largest hip-hop share in Europe at 40%" },
    ],
  },
  {
    region: "Germany / Netherlands",
    genre: "Electronic",
    icon: "🎛",
    color: "#38bdf8",
    description:
      "Northern Europe&rsquos electronic music heritage — from Kraftwerk to Berlin&rsquos techno scene — gives Germany and the Netherlands the highest electronic genre share of any large market, at 32&ndash;38% in 2024.",
    milestones: [
      { year: 1974, event: "Kraftwerk Autobahn — electronic pop enters mainstream" },
      { year: 1989, event: "Berlin wall falls; techno explosion in unified Berlin" },
      { year: 2010, event: "EDM goes global; Tiesto, Armin van Buuren reach mass audience" },
      { year: 2024, event: "Germany: 32% electronic, highest of any G7 country" },
    ],
  },
  {
    region: "Japan",
    genre: "J-Pop",
    icon: "🌸",
    color: "#06b6d4",
    description:
      "Japan is the world&rsquos second-largest recorded music market, dominated by J-Pop — a genre almost entirely separate from global trends. Despite streaming&rsquos rise, J-Pop retains 50%+ domestic share, with physical sales still significant.",
    milestones: [
      { year: 1990, event: "J-Pop peaks: Hikaru Utada era begins" },
      { year: 1998, event: "First Love by Hikaru Utada — best-selling Japanese album ever" },
      { year: 2015, event: "Streaming arrives; J-Pop share slowly declines" },
      { year: 2024, event: "J-Pop at 50% — still dominant in world&rsquos #2 music market" },
    ],
  },
]
