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
  const genres = score.genreDistribution.slice(0, 7)
  const maxShare = genres[0]?.share ?? 1

  // Each bar is 420px wide max
  const BAR_MAX = 420

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
        <span style={{ color: "#3f3f46", fontSize: 13 }}>Genre Fingerprint</span>
      </div>

      {/* Name */}
      <span style={{ color: "#52525b", fontSize: 15, fontWeight: 600, letterSpacing: "0.1em", marginTop: 32 }}>
        {profile.displayName.toUpperCase()}
      </span>

      {/* Genre bars */}
      <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
          {genres.map((g, i) => (
            <div key={g.genre} style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {/* Rank */}
              <span style={{ color: "#3f3f46", fontSize: 12, width: 20, textAlign: "right" }}>
                {i + 1}
              </span>
              {/* Bar */}
              <div style={{ width: BAR_MAX, height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 100, display: "flex" }}>
                <div
                  style={{
                    height: 8,
                    width: Math.round((g.share / maxShare) * BAR_MAX),
                    background: "#f97316",
                    opacity: i === 0 ? 1 : Math.max(0.2, 1 - i * 0.12),
                    borderRadius: 100,
                  }}
                />
              </div>
              {/* Genre name */}
              <span
                style={{
                  color: i === 0 ? "#f4f4f5" : "#71717a",
                  fontSize: 15,
                  fontWeight: i === 0 ? 600 : 400,
                  textTransform: "capitalize",
                  flex: 1,
                }}
              >
                {g.genre}
              </span>
              {/* Percent */}
              <span style={{ color: "#52525b", fontSize: 13 }}>{Math.round(g.share)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#3f3f46", fontSize: 13 }}>unwrapped-one.vercel.app</span>
        <span style={{ color: "#3f3f46", fontSize: 13 }}>What&apos;s your fingerprint? →</span>
      </div>
    </div>,
    { ...size, fonts }
  )
}
