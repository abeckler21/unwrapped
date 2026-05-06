import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { computeBubbleScore } from "@/lib/analysis/bubble-score"
import { readCachedSpotifyProfile } from "@/lib/cache/spotify-profile-cache"
import { mockProfile } from "@/lib/data/mock-profile"
import { formatPercent, formatDuration } from "@/lib/format"

type Props = { params: Promise<{ userId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params
  const profile =
    userId === mockProfile.userId
      ? mockProfile
      : await readCachedSpotifyProfile(userId, { ignoreTtl: true })
  if (!profile) return { title: "Unwrapped" }
  const score = computeBubbleScore(profile, "medium_term")
  return {
    title: `${profile.displayName}'s Filter Bubble Score — ${Math.round(score.score)} (${score.tier})`,
    description: `${Math.round(score.algorithmicRatio)}% algorithmic listening, ${Math.round(score.organicRatio)}% organic. See your own at Unwrapped.`,
  }
}

const BREAKDOWN_LABELS: Record<string, string> = {
  genreConcentration: "Genre concentration",
  artistRepetition: "Artist repetition",
  popularitySkew: "Popularity skew",
  temporalConsistency: "Taste consistency",
}

export default async function BubbleSharePage({ params }: Props) {
  const { userId } = await params
  const profile =
    userId === mockProfile.userId
      ? mockProfile
      : await readCachedSpotifyProfile(userId, { ignoreTtl: true })

  if (!profile) notFound()

  const score = computeBubbleScore(profile, "medium_term")

  return (
    <main className="mx-auto flex min-h-[calc(100vh-84px)] w-full max-w-2xl flex-col justify-center px-5 py-10 sm:px-8">
      <section className="panel panel-glow flex flex-col gap-8 p-8 sm:p-10">
        <div>
          <p className="eyebrow">{profile.displayName}&apos;s Filter Bubble Score</p>
          <div className="mt-3 flex flex-wrap items-end gap-4">
            <span
              className="font-semibold leading-none tabular-nums text-[var(--text-strong)]"
              style={{ fontSize: "clamp(4rem,14vw,7rem)" }}
            >
              {Math.round(score.score)}
            </span>
            <div className="pb-2">
              <p className="text-2xl font-medium text-[var(--accent)]">{score.tier}</p>
              <p className="mt-0.5 text-sm text-[var(--text-muted)]">out of 100</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Organic</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--text-strong)]">
              {formatPercent(score.organicRatio)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Algorithmic</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--text-strong)]">
              {formatPercent(score.algorithmicRatio)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Avg. track</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--text-strong)]">
              {formatDuration(score.averageTrackDurationMs)}
            </p>
          </div>
        </div>

        {/* Breakdown bars */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
            Score breakdown
          </p>
          {score.breakdown.map((item) => (
            <div key={item.key} className="flex items-center gap-3">
              <span className="w-40 shrink-0 text-xs text-[var(--text-soft)]">
                {BREAKDOWN_LABELS[item.key] ?? item.label}
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--accent)]/60"
                  style={{ width: `${item.score}%` }}
                />
              </div>
              <span className="w-8 text-right text-xs tabular-nums text-[var(--text-muted)]">
                {Math.round(item.score)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 border-t border-white/8 pt-6">
          <Link href="/" className="button-primary">
            See your own Unwrapped
          </Link>
          <Link href={`/share/${userId}`} className="button-secondary">
            Full snapshot
          </Link>
        </div>
      </section>
    </main>
  )
}
