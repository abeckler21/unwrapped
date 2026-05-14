import { notFound } from "next/navigation"
import { computeBubbleScore } from "@/lib/analysis/bubble-score"
import { readCachedSpotifyProfile } from "@/lib/cache/spotify-profile-cache"
import { mockProfile } from "@/lib/data/mock-profile"
import { formatPercent } from "@/lib/format"
import { getThemeColors, parseTheme } from "@/lib/widgets/theme"

type Props = {
  params: Promise<{ userId: string }>
  searchParams: Promise<{ theme?: string | string[] }>
}

export const metadata = { robots: "noindex" }

export default async function GenresWidget({ params, searchParams }: Props) {
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
  const genres = score.genreDistribution.slice(0, 6)

  const COLORS = ["#f97316", "#fb7185", "#22c55e", "#38bdf8", "#eab308", "#a855f7"]

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
            Genre Footprint
          </div>
        </div>
        {score.hasGenreMetadata && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: "10px",
              color: c.textMuted,
              fontFamily: "monospace",
              letterSpacing: "0.1em",
            }}
          >
            HHI {score.genreDistribution.reduce((s, g) => s + (g.share / 100) ** 2, 0).toFixed(2)}
          </span>
        )}
      </div>

      {/* Body: donut + genre list */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: "16px",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {/* Donut — fixed width, compact */}
        <div style={{ flexShrink: 0, width: "140px", height: "140px" }}>
          {genres.length > 0 ? (
            <svg
              width="140"
              height="140"
              viewBox="0 0 220 220"
              style={{ display: "block" }}
            >
              <circle
                cx="110"
                cy="110"
                r="78"
                fill="none"
                stroke={c.cardBg === "rgba(255,255,255,0.04)" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}
                strokeWidth="34"
              />
              {(() => {
                const total = genres.reduce((s, g) => s + g.share, 0) || 1
                let offset = 0
                return genres.map((g, i) => {
                  const norm = (g.share / total) * 100
                  const dash = Math.max(norm - 0.75, 0)
                  const seg = (
                    <circle
                      key={g.genre}
                      cx="110"
                      cy="110"
                      r="78"
                      fill="none"
                      pathLength={100}
                      stroke={COLORS[i % COLORS.length]}
                      strokeDasharray={`${dash} ${100 - dash}`}
                      strokeDashoffset={-offset}
                      strokeLinecap="round"
                      strokeWidth="34"
                      transform="rotate(-90 110 110)"
                    />
                  )
                  offset += norm
                  return seg
                })
              })()}
              {genres[0] && (
                <>
                  <text
                    x="110"
                    y="103"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="22"
                    fontWeight="700"
                    fill={c.accent}
                    fontFamily="inherit"
                  >
                    {formatPercent(genres[0].share)}
                  </text>
                  <text
                    x="110"
                    y="124"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fill={c.textMuted}
                    fontFamily="inherit"
                  >
                    top genre
                  </text>
                </>
              )}
            </svg>
          ) : (
            <div
              style={{
                width: "140px",
                height: "140px",
                borderRadius: "50%",
                border: `1px solid ${c.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                color: c.textMuted,
              }}
            >
              No data
            </div>
          )}
        </div>

        {/* Genre list */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            overflow: "hidden",
          }}
        >
          {genres.map((g, i) => (
            <div key={g.genre} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "999px",
                  background: COLORS[i % COLORS.length],
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  flex: 1,
                  fontSize: "11px",
                  color: c.textSoft,
                  textTransform: "capitalize",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {g.genre}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: i === 0 ? c.accent : c.textStrong,
                  tabularNums: "tabular-nums",
                  flexShrink: 0,
                } as React.CSSProperties}
              >
                {formatPercent(g.share)}
              </span>
            </div>
          ))}
          {!score.hasGenreMetadata && (
            <p style={{ fontSize: "11px", color: c.textMuted }}>
              Genre data unavailable.
            </p>
          )}
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
