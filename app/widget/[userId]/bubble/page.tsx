import { notFound } from "next/navigation"
import { computeBubbleScore } from "@/lib/analysis/bubble-score"
import { readCachedSpotifyProfile } from "@/lib/cache/spotify-profile-cache"
import { mockProfile } from "@/lib/data/mock-profile"
import { formatDuration, formatPercent } from "@/lib/format"
import { getThemeColors, parseTheme } from "@/lib/widgets/theme"

type Props = {
  params: Promise<{ userId: string }>
  searchParams: Promise<{ theme?: string | string[] }>
}

export const metadata = { robots: "noindex" }

export default async function BubbleWidget({ params, searchParams }: Props) {
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

  function tierColor(tier: string) {
    switch (tier) {
      case "Wide Open": return "#38bdf8"
      case "Narrowing":  return "#facc15"
      case "In the Loop": return c.accent
      case "Deep in the Algorithm": return "#f87171"
      default: return c.accent
    }
  }

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
        gap: "16px",
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
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "10px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: c.textMuted,
          }}
        >
          Unwrapped
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontFamily: "monospace",
            fontSize: "9px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: c.textMuted,
          }}
        >
          Filter Bubble Score
        </span>
      </div>

      {/* Score hero */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", flex: 1 }}>
        <div>
          <div
            style={{
              fontSize: "clamp(3.5rem, 14vw, 5rem)",
              fontWeight: 800,
              lineHeight: 1,
              color: c.accent,
              letterSpacing: "-0.02em",
              tabularNums: "tabular-nums",
            } as React.CSSProperties}
          >
            {Math.round(score.score)}
          </div>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 600,
              marginTop: "6px",
              color: tierColor(score.tier),
            }}
          >
            {score.tier}
          </div>
          <div style={{ fontSize: "10px", color: c.textMuted, marginTop: "2px" }}>
            out of 100
          </div>
        </div>

        {/* Stat pills */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            marginLeft: "auto",
            alignSelf: "flex-end",
          }}
        >
          <div
            style={{
              borderRadius: "999px",
              border: `1px solid ${c.border}`,
              background: c.cardBg,
              padding: "4px 12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "11px",
            }}
          >
            <span style={{ color: c.textMuted }}>Algorithmic</span>
            <span style={{ color: c.textStrong, fontWeight: 700 }}>
              {formatPercent(score.algorithmicRatio)}
            </span>
          </div>
          <div
            style={{
              borderRadius: "999px",
              border: `1px solid ${c.border}`,
              background: c.cardBg,
              padding: "4px 12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "11px",
            }}
          >
            <span style={{ color: c.textMuted }}>Top genre</span>
            <span
              style={{
                color: c.textStrong,
                fontWeight: 700,
                maxWidth: "90px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {score.primaryGenre.name}
            </span>
          </div>
          <div
            style={{
              borderRadius: "999px",
              border: `1px solid ${c.border}`,
              background: c.cardBg,
              padding: "4px 12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "11px",
            }}
          >
            <span style={{ color: c.textMuted }}>Avg track</span>
            <span style={{ color: c.textStrong, fontWeight: 700 }}>
              {formatDuration(score.averageTrackDurationMs)}
            </span>
          </div>
        </div>
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
