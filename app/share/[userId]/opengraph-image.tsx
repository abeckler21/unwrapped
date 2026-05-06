import { ImageResponse } from "next/og"
import { computeBubbleScore } from "@/lib/analysis/bubble-score"
import { readCachedSpotifyProfile } from "@/lib/cache/spotify-profile-cache"
import { readCachedArchetype } from "@/lib/ai/archetype"
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
      <div
        style={{
          width: 1200, height: 630,
          background: "#09080e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Inter",
        }}
      >
        <span style={{ color: "#71717a", fontSize: 32 }}>Profile not found</span>
      </div>,
      { ...size, fonts }
    )
  }

  const score = computeBubbleScore(profile, "medium_term")
  const archetype = userId === mockProfile.userId ? null : await readCachedArchetype(userId)
  const topGenres = score.genreDistribution.slice(0, 3).map((g) => g.genre)

  return new ImageResponse(
    <div
      style={{
        width: 1200, height: 630,
        background: "#09080e",
        display: "flex",
        flexDirection: "column",
        padding: "56px 72px",
        fontFamily: "Inter",
        position: "relative",
      }}
    >
      {/* Brand */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#f97316", fontSize: 14, fontWeight: 700, letterSpacing: "0.18em" }}>
          UNWRAPPED
        </span>
        <span style={{ color: "#3f3f46", fontSize: 13 }}>unwrapped-one.vercel.app</span>
      </div>

      {/* Main content */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: 52, flex: 1 }}>
        <span style={{ color: "#71717a", fontSize: 15, letterSpacing: "0.1em", fontWeight: 600 }}>
          {profile.displayName.toUpperCase()}&apos;S UNWRAPPED SNAPSHOT
        </span>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginTop: 20 }}>
          <span style={{ color: "#f4f4f5", fontSize: 128, fontWeight: 700, lineHeight: 1 }}>
            {Math.round(score.score)}
          </span>
          <div style={{ display: "flex", flexDirection: "column", paddingBottom: 16 }}>
            <span style={{ color: "#f97316", fontSize: 28, fontWeight: 700 }}>{score.tier}</span>
            <span style={{ color: "#71717a", fontSize: 15, marginTop: 6 }}>Filter Bubble Score</span>
          </div>
        </div>

        {archetype && (
          <span style={{ color: "#a1a1aa", fontSize: 20, marginTop: 20, fontWeight: 400 }}>
            Listener archetype: <span style={{ color: "#f4f4f5", fontWeight: 600 }}>{archetype.name}</span>
          </span>
        )}

        {topGenres.length > 0 && (
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            {topGenres.map((g) => (
              <span
                key={g}
                style={{
                  background: "rgba(249,115,22,0.12)",
                  border: "1px solid rgba(249,115,22,0.25)",
                  color: "#f97316",
                  borderRadius: 100,
                  padding: "6px 18px",
                  fontSize: 14,
                  fontWeight: 500,
                  textTransform: "capitalize",
                }}
              >
                {g}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: "#3f3f46", fontSize: 14 }}>See yours at unwrapped-one.vercel.app</span>
      </div>
    </div>,
    { ...size, fonts }
  )
}
