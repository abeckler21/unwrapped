import { Suspense } from "react"

import { getOrGenerateArchetype } from "@/lib/ai/archetype"
import { computeBubbleScore } from "@/lib/analysis/bubble-score"
import { readCachedEscapeRecs } from "@/lib/escape/cache"
import { getCurrentSpotifyProfile } from "@/lib/spotify/current-profile"
import { NarrativeContent } from "@/components/narrative/narrative-content"
import { ScrollPreserver } from "@/components/narrative/scroll-preserver"
import type { Archetype } from "@/lib/ai/archetype"
import type { BubbleScoreResult } from "@/lib/analysis/bubble-score"
import type { EscapeRecommendation } from "@/lib/escape/pipeline"
import type { SpotifyProfile } from "@/lib/types/spotify"

export const metadata = {
  title: "The Full Story — Unwrapped",
  description:
    "A guided scroll through your algorithmic profile: where you are, how you got here, what the industry did, what you're missing, and what to do about it.",
}

// ── Streaming wrapper ─────────────────────────────────────────────────────────
// Awaits the LLM archetype call so the rest of the page resolves immediately
// and the narrative streams in once the archetype is ready.

type NarrativeProps = {
  profile: SpotifyProfile
  usingDemoData: boolean
  score: BubbleScoreResult
  escapeRecs: EscapeRecommendation[] | null
}

async function StoryNarrative({ profile, usingDemoData, score, escapeRecs }: NarrativeProps) {
  const archetype: Archetype = await getOrGenerateArchetype(profile, usingDemoData, score)
  return (
    <NarrativeContent
      profile={profile}
      usingDemoData={usingDemoData}
      score={score}
      archetype={archetype}
      escapeRecs={escapeRecs}
    />
  )
}

function StorySkeleton() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5">
      <div className="mx-auto w-full max-w-2xl space-y-8 text-center">
        <div className="h-3 w-20 animate-pulse rounded-full bg-white/10 mx-auto" />
        <div className="h-12 w-64 animate-pulse rounded-2xl bg-white/8 mx-auto" />
        <div className="space-y-3">
          <div className="h-5 w-full animate-pulse rounded-full bg-white/6" />
          <div className="h-5 w-5/6 animate-pulse rounded-full bg-white/6 mx-auto" />
          <div className="h-5 w-4/6 animate-pulse rounded-full bg-white/6 mx-auto" />
        </div>
        <div className="h-36 animate-pulse rounded-2xl bg-white/[0.03] border border-white/8" />
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function StoryPage() {
  const { profile, usingDemoData } = await getCurrentSpotifyProfile()
  const score = computeBubbleScore(profile, "medium_term")
  const escapeRecs = usingDemoData
    ? null
    : await readCachedEscapeRecs(profile.userId)

  return (
    <main>
      <ScrollPreserver />
      <Suspense fallback={<StorySkeleton />}>
        <StoryNarrative
          profile={profile}
          usingDemoData={usingDemoData}
          score={score}
          escapeRecs={escapeRecs}
        />
      </Suspense>
    </main>
  )
}
