import { notFound } from "next/navigation"
import { computeBubbleScore } from "@/lib/analysis/bubble-score"
import { computeListeningProfile, ALGORITHMIC_ARCHETYPE } from "@/lib/analysis/listening-profile"
import { readCachedSpotifyProfile } from "@/lib/cache/spotify-profile-cache"
import { mockProfile } from "@/lib/data/mock-profile"
import { formatDuration, formatPercent } from "@/lib/format"
import { getThemeColors, parseTheme } from "@/lib/widgets/theme"
import { ListeningProfileChart } from "@/components/visualizations/listening-profile-chart"

type Props = {
  params: Promise<{ userId: string }>
  searchParams: Promise<{ theme?: string | string[] }>
}

export const metadata = { robots: "noindex" }

export default async function FingerprintWidget({ params, searchParams }: Props) {
  const { userId } = await params
  const { theme: themeRaw } = await searchParams
  const theme = parseTheme(themeRaw)
  const c = getThemeColors(theme)

  const profile =
    userId === mockProfile.userId
      ? mockProfile
      : await readCachedSpotifyProfile(userId, { ignoreTtl: true })

  if (!profile) notFound()

  const score = computeBubbleScore(profile, "medium_term")
  const listeningProfile = computeListeningProfile(profile, "medium_term")

  return (
    <div
      style={{
        background: c.bg,
        color: c.textStrong,
        fontFamily: "'Avenir Next','Trebuchet MS','Segoe UI',sans-serif",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "20px",
        boxSizing: "border-box",
        gap: "14px",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "28px",
            height: "28px",
            borderRadius: "999px",
            border: `1px solid ${c.border}`,
            background: "radial-gradient(circle at top, rgba(249,115,22,0.35), rgba(56,189,248,0.18))",
            fontSize: "11px",
            fontWeight: 700,
            color: c.textStrong,
          }}
        >
          U
        </span>
        <div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "10px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: c.textMuted,
            }}
          >
            Unwrapped
          </div>
          <div style={{ fontSize: "12px", fontWeight: 600, color: c.textStrong, marginTop: "1px" }}>
            Listening Profile
          </div>
        </div>
      </div>

      {/* Chart — always on dark card for visibility */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: c.chartBg,
          borderRadius: "16px",
          border: `1px solid rgba(255,255,255,0.08)`,
          padding: "12px",
          minHeight: 0,
        }}
      >
        <ListeningProfileChart
          profile={listeningProfile}
          comparison={ALGORITHMIC_ARCHETYPE}
          comparisonLabel="Algorithm ideal"
          size={200}
        />
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
        }}
      >
        {[
          { label: "Avg song", value: formatDuration(listeningProfile.meanDurationMs) },
          { label: "Recent releases", value: formatPercent(listeningProfile.recentPercent) },
          { label: "Genre HHI", value: listeningProfile.genreHHI.toFixed(2) },
          { label: "Bubble score", value: String(Math.round(score.score)) },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              background: c.cardBg,
              border: `1px solid ${c.border}`,
              borderRadius: "10px",
              padding: "8px 10px",
            }}
          >
            <div style={{ fontSize: "9px", color: c.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {label}
            </div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: c.textStrong, marginTop: "2px" }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: `1px solid ${c.divider}`,
          paddingTop: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: "10px", color: c.textMuted }}>
          {profile.displayName}
        </span>
        <a
          href="https://unwrapped.vercel.app"
          style={{
            fontSize: "10px",
            color: c.accent,
            textDecoration: "none",
            letterSpacing: "0.06em",
          }}
        >
          unwrapped.vercel.app
        </a>
      </div>
    </div>
  )
}
