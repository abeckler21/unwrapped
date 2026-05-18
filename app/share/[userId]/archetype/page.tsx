import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

export const revalidate = 3600

import { readCachedArchetype } from "@/lib/ai/archetype"
import { computeBubbleScore } from "@/lib/analysis/bubble-score"
import { readCachedSpotifyProfile } from "@/lib/cache/spotify-profile-cache"
import { mockProfile } from "@/lib/data/mock-profile"

type Props = { params: Promise<{ userId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params
  const profile =
    userId === mockProfile.userId
      ? mockProfile
      : await readCachedSpotifyProfile(userId, { ignoreTtl: true })
  if (!profile) return { title: "Unwrapped" }
  const archetype = userId === mockProfile.userId ? null : await readCachedArchetype(userId)
  const score = computeBubbleScore(profile, "medium_term")
  const name = archetype?.name ?? score.tier
  return {
    title: `${profile.displayName} is "${name}" — Unwrapped Listener Archetype`,
    description: archetype?.prose ?? "Listener archetype generated from your Spotify listening data.",
  }
}

export default async function ArchetypeSharePage({ params }: Props) {
  const { userId } = await params
  const profile =
    userId === mockProfile.userId
      ? mockProfile
      : await readCachedSpotifyProfile(userId, { ignoreTtl: true })

  if (!profile) notFound()

  const archetype = userId === mockProfile.userId ? null : await readCachedArchetype(userId)
  const score = computeBubbleScore(profile, "medium_term")

  return (
    <main className="mx-auto flex min-h-[calc(100vh-84px)] w-full max-w-2xl flex-col justify-center px-5 py-10 sm:px-8">
      <section className="panel panel-glow flex flex-col gap-8 p-8 sm:p-10">
        <div>
          <p className="eyebrow">{profile.displayName}&apos;s listener archetype</p>
          <p className="mt-3 text-3xl font-semibold text-[var(--accent)] sm:text-4xl">
            {archetype?.name ?? score.tier}
          </p>
        </div>

        {archetype ? (
          <p className="text-sm leading-7 text-[var(--text-muted)]">{archetype.prose}</p>
        ) : (
          <p className="text-sm leading-7 text-[var(--text-muted)]">
            Archetype analysis is based on 6-month listening data. Log in to generate yours.
          </p>
        )}

        {/* Top genres as context */}
        {score.hasGenreMetadata && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Genre fingerprint
            </p>
            <div className="flex flex-wrap gap-2">
              {score.genreDistribution.slice(0, 6).map((g) => (
                <span
                  key={g.genre}
                  className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs capitalize text-[var(--text-soft)]"
                >
                  {g.genre}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 border-t border-white/8 pt-2">
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
