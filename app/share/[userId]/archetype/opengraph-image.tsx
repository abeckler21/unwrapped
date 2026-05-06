import { ImageResponse } from "next/og"
import { readCachedArchetype } from "@/lib/ai/archetype"
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

  const archetype = userId === mockProfile.userId ? null : await readCachedArchetype(userId)
  const score = computeBubbleScore(profile, "medium_term")
  const topGenres = score.genreDistribution.slice(0, 4).map((g) => g.genre)

  // Truncate prose to ~180 chars for the OG card
  const prose = archetype?.prose
    ? archetype.prose.length > 180
      ? archetype.prose.slice(0, 177) + "…"
      : archetype.prose
    : null

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
        <span style={{ color: "#3f3f46", fontSize: 13 }}>Listener Archetype</span>
      </div>

      {/* Main */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
        <span style={{ color: "#52525b", fontSize: 15, fontWeight: 600, letterSpacing: "0.1em" }}>
          {profile.displayName.toUpperCase()}
        </span>

        <span
          style={{
            color: "#f97316",
            fontSize: archetype?.name && archetype.name.length > 24 ? 52 : 64,
            fontWeight: 700,
            lineHeight: 1.1,
            marginTop: 16,
          }}
        >
          {archetype?.name ?? score.tier}
        </span>

        {prose && (
          <span style={{ color: "#a1a1aa", fontSize: 20, lineHeight: 1.6, marginTop: 24, maxWidth: 900 }}>
            {prose}
          </span>
        )}

        {topGenres.length > 0 && (
          <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
            {topGenres.map((g) => (
              <span
                key={g}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#a1a1aa",
                  borderRadius: 100,
                  padding: "5px 16px",
                  fontSize: 13,
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#3f3f46", fontSize: 13 }}>unwrapped-one.vercel.app</span>
        <span style={{ color: "#3f3f46", fontSize: 13 }}>What&apos;s your archetype? →</span>
      </div>
    </div>,
    { ...size, fonts }
  )
}
