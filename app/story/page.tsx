import { getOrGenerateArchetype } from "@/lib/ai/archetype"
import { computeBubbleScore } from "@/lib/analysis/bubble-score"
import { readCachedEscapeRecs } from "@/lib/escape/cache"
import { getCurrentSpotifyProfile } from "@/lib/spotify/current-profile"
import { NarrativeContent } from "@/components/narrative/narrative-content"
import type { EscapeRecommendation } from "@/lib/escape/pipeline"

export const metadata = {
  title: "The Full Story — Unwrapped",
  description:
    "A guided scroll through your algorithmic profile: where you are, how you got here, what the industry did, what you're missing, and what to do about it.",
}

export default async function StoryPage() {
  const { profile, usingDemoData } = await getCurrentSpotifyProfile()

  const score = computeBubbleScore(profile, "medium_term")

  const [archetype, escapeRecs] = await Promise.all([
    getOrGenerateArchetype(profile, usingDemoData, score),
    usingDemoData
      ? Promise.resolve<EscapeRecommendation[] | null>(null)
      : readCachedEscapeRecs(profile.userId),
  ])

  return (
    <main>
      <NarrativeContent
        profile={profile}
        usingDemoData={usingDemoData}
        score={score}
        archetype={archetype}
        escapeRecs={escapeRecs}
      />
    </main>
  )
}
