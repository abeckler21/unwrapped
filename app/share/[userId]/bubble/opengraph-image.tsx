import { ImageResponse } from "next/og"
import { computeBubbleScore } from "@/lib/analysis/bubble-score"
import { readCachedSpotifyProfile } from "@/lib/cache/spotify-profile-cache"
import { mockProfile } from "@/lib/data/mock-profile"
import { loadInterFonts } from "@/lib/og/font"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const fonts = await loadInterFonts()

  const profile =
    userId === mockProfile.userId
      ? mockProfile
      : await readCachedSpotifyProfile(userId, { ignoreTtl: true })

  if (!profile) {
    return new ImageResponse(
      <div style={{ width: 1200, height: 630, background: "#09080e", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter" }}>
        <span style={{ color: "#71717a", fontSize: 28 }}>Profile not found</span>
      </div>,
      { ...size, fonts }
    )
  }

  const score = computeBubbleScore(profile, "medium_term")

  const TIER_COLORS: Record<string, string> = {
    "Wide Open": "#22c55e",
    "Narrowing": "#eab308",
    "In the Loop": "#f97316",
    "Deep in the Algorithm": "#ef4444",
  }
  const tierColor = TIER_COLORS[score.tier] ?? "#f97316"

  const breakdownLabels: Record<string, string> = {
    genreConcentration: "Genre concentration",
    artistRepetition: "Artist repetition",
      temporalConsistency: "Taste consistency",
  }

  return new ImageResponse(
    <div
      style={{
        width: 1200, height: 630,
        background: "#09080e",
        display: "flex",
        flexDirection: "column",
        padding: "52px 72px",
        fontFamily: "Inter",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#f97316", fontSize: 13, fontWeight: 700, letterSpacing: "0.18em" }}>UNWRAPPED</span>
        <span style={{ color: "#3f3f46", fontSize: 13 }}>Filter Bubble Score</span>
      </div>

      {/* Main */}
      <div style={{ display: "flex", flex: 1, alignItems: "center", gap: 80, marginTop: 40 }}>
        {/* Left: big number */}
        <div style={{ display: "flex", flexDirection: "column", minWidth: 280 }}>
          <span style={{ color: "#52525b", fontSize: 15, fontWeight: 600, letterSpacing: "0.1em" }}>
            {profile.displayName.toUpperCase()}
          </span>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginTop: 16 }}>
            <span style={{ color: "#f4f4f5", fontSize: 144, fontWeight: 700, lineHeight: 1 }}>
              {Math.round(score.score)}
            </span>
            <div style={{ display: "flex", flexDirection: "column", paddingBottom: 20 }}>
              <span style={{ color: tierColor, fontSize: 26, fontWeight: 700 }}>{score.tier}</span>
              <span style={{ color: "#71717a", fontSize: 14, marginTop: 8 }}>out of 100</span>
            </div>
          </div>
        </div>

        {/* Right: breakdown bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18, flex: 1 }}>
          {score.breakdown.map((item) => (
            <div key={item.key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#a1a1aa", fontSize: 13 }}>
                  {breakdownLabels[item.key] ?? item.label}
                </span>
                <span style={{ color: "#f4f4f5", fontSize: 13, fontWeight: 700 }}>
                  {Math.round(item.score)}
                </span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 100, display: "flex" }}>
                <div
                  style={{
                    height: 6,
                    width: `${item.score}%`,
                    background: "rgba(249,115,22,0.6)",
                    borderRadius: 100,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#3f3f46", fontSize: 13 }}>unwrapped-one.vercel.app</span>
        <span style={{ color: "#3f3f46", fontSize: 13 }}>See your own →</span>
      </div>
    </div>,
    { ...size, fonts }
  )
}
