import { generateText } from 'ai'
import { getModel } from '@/lib/ai/client'
import { getSupabaseAdminClient as getSupabase } from '@/lib/supabase/admin'
import { computeBubbleScore } from '@/lib/analysis/bubble-score'
import type { SpotifyProfile } from '@/lib/types/spotify'
import type { BubbleScoreResult } from '@/lib/analysis/bubble-score'

export type Archetype = {
  name: string
  prose: string
}

// ── Rule-based category assignment ──────────────────────────────────────────

const ARCHETYPES = [
  {
    name: 'The Passenger',
    test: (s: BubbleScoreResult) =>
      s.score >= 65 && s.algorithmicRatio >= 55,
  },
  {
    name: 'The Retreater',
    test: (s: BubbleScoreResult) => {
      const temporal = s.breakdown.find(b => b.key === 'temporalConsistency')
      const genre = s.breakdown.find(b => b.key === 'genreConcentration')
      return (temporal?.score ?? 0) >= 70 && (genre?.score ?? 0) >= 60
    },
  },
  {
    name: 'The Loyalist',
    test: (s: BubbleScoreResult) => {
      const rep = s.breakdown.find(b => b.key === 'artistRepetition')
      return (rep?.score ?? 0) >= 70
    },
  },
  {
    name: 'The Omnivore',
    test: (s: BubbleScoreResult) => {
      const genre = s.breakdown.find(b => b.key === 'genreConcentration')
      const rep = s.breakdown.find(b => b.key === 'artistRepetition')
      return (genre?.score ?? 100) <= 25 && (rep?.score ?? 100) <= 45
    },
  },
  {
    name: 'The Archaeologist',
    test: (s: BubbleScoreResult) => {
      const pop = s.breakdown.find(b => b.key === 'popularitySkew')
      return (pop?.score ?? 100) <= 40
    },
  },
  {
    name: 'The Curator',
    test: () => true, // fallback
  },
] as const

function assignArchetypeName(score: BubbleScoreResult): string {
  return ARCHETYPES.find(a => a.test(score))?.name ?? 'The Curator'
}

// ── LLM prose generation ─────────────────────────────────────────────────────

async function generateArchetypeProse(
  archetypeName: string,
  profile: SpotifyProfile,
  score: BubbleScoreResult,
): Promise<string> {
  const topArtists = profile.timeRanges.medium_term.topArtists
    .slice(0, 3)
    .map(a => a.name)
    .join(', ') || 'unknown artists'

  const topGenres = score.genreDistribution
    .slice(0, 3)
    .map(g => g.genre)
    .join(', ') || 'unclassified genres'

  const temporal = score.breakdown.find(b => b.key === 'temporalConsistency')
  const temporalNote =
    (temporal?.score ?? 50) >= 70
      ? 'their short-term and long-term taste are nearly identical — they are looping'
      : (temporal?.score ?? 50) <= 35
        ? 'their taste has shifted significantly between short-term and long-term — something changed'
        : 'their taste is moderately consistent across time'

  const prompt = `You are writing a listener profile for a music analytics app called Unwrapped — the dark side of Spotify Wrapped. Your job is to write a sharp, specific, 2–3 sentence personal reading for a listener. No filler, no flattery. Be direct and a little unsettling where the data warrants it. Sound like a music journalist, not a horoscope.

Listener data:
- Archetype: ${archetypeName}
- Filter Bubble Score: ${score.score}/100 (tier: ${score.tier})
- Primary genre: ${score.primaryGenre.name} (${score.primaryGenre.share}% of listening)
- Top genres: ${topGenres}
- Top artists: ${topArtists}
- Estimated algorithmic exposure: ${score.algorithmicRatio}% of listening is likely algorithmically surfaced
- Temporal pattern: ${temporalNote}

Write the 2–3 sentence prose reading now. Refer to the listener in second person ("you"). Do not mention the archetype name itself — let the description speak for it. Do not start with "You are" — vary the opening.`

  const { text } = await generateText({
    model: getModel(),
    prompt,
    maxOutputTokens: 180,
  })

  return text.trim()
}

// ── Supabase cache ───────────────────────────────────────────────────────────

const CACHE_TTL_DAYS = 7

async function readCachedArchetype(userId: string): Promise<Archetype | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const { data } = await supabase
    .from('user_archetypes')
    .select('archetype_name, archetype_prose, generated_at')
    .eq('spotify_user_id', userId)
    .single()

  if (!data) return null

  const ageMs = Date.now() - new Date(data.generated_at).getTime()
  if (ageMs > CACHE_TTL_DAYS * 24 * 60 * 60 * 1000) return null

  return { name: data.archetype_name, prose: data.archetype_prose }
}

async function writeCachedArchetype(userId: string, archetype: Archetype) {
  const supabase = getSupabase()
  if (!supabase) return

  await supabase.from('user_archetypes').upsert({
    spotify_user_id: userId,
    archetype_name: archetype.name,
    archetype_prose: archetype.prose,
    generated_at: new Date().toISOString(),
  })
}

// ── Public API ───────────────────────────────────────────────────────────────

const DEMO_ARCHETYPE: Archetype = {
  name: 'The Retreater',
  prose:
    "Your listening has calcified into a comfortable loop — the same handful of genres cycling through, short-term taste barely distinguishable from all-time. This isn't discovery anymore; it's confirmation. The algorithm has learned exactly which walls to build around you, and you've started calling them home.",
}

export async function getOrGenerateArchetype(
  profile: SpotifyProfile,
  usingDemoData: boolean,
): Promise<Archetype> {
  if (usingDemoData) return DEMO_ARCHETYPE

  const cached = await readCachedArchetype(profile.userId)
  if (cached) return cached

  const score = computeBubbleScore(profile, 'medium_term')
  const name = assignArchetypeName(score)

  let prose: string
  try {
    prose = await generateArchetypeProse(name, profile, score)
  } catch {
    // If LLM is unavailable (e.g. Ollama not running locally), fall back gracefully
    prose = `Your listening patterns place you firmly in "${name}" territory — a profile shaped by ${score.primaryGenre.name} and ${score.algorithmicRatio}% algorithmic exposure. The data tells a story worth examining.`
  }

  const archetype: Archetype = { name, prose }
  await writeCachedArchetype(profile.userId, archetype)
  return archetype
}
