import { generateText } from 'ai'
import { z } from 'zod'
import { getModel } from '@/lib/ai/client'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

// ── Types ────────────────────────────────────────────────────────────────────

export type Pioneer = {
  name: string
  years: string          // e.g. "1920s–1950s"
  role: string           // one sentence
  imageQuery: string     // Wikimedia Commons search query
  imageUrl: string | null
}

export type LineageNode = {
  year: number
  label: string          // e.g. "New Orleans" or "Miles Davis" or "D'Angelo"
  note: string           // very short annotation
}

export type GenreHistory = {
  genre: string          // display name
  originEra: string      // e.g. "1910s–1920s"
  originPlace: string    // e.g. "New Orleans, Louisiana"
  culturalContext: string // 2–3 sentences
  pioneers: Pioneer[]
  lineage: LineageNode[] // the horizontal rail data, chronological
}

// ── Zod schema for structured LLM output ────────────────────────────────────

const PioneerSchema = z.object({
  name: z.string(),
  years: z.string(),
  role: z.string(),
  imageQuery: z.string(),
})

const LineageNodeSchema = z.object({
  year: z.number(),
  label: z.string(),
  note: z.string(),
})

const GenreHistorySchema = z.object({
  genre: z.string(),
  originEra: z.string(),
  originPlace: z.string(),
  culturalContext: z.string(),
  pioneers: z.array(PioneerSchema).min(1),
  lineage: z.array(LineageNodeSchema).min(2),
})

// ── Wikimedia Commons image fetch ────────────────────────────────────────────

async function fetchWikimediaImage(query: string): Promise<string | null> {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(query)}&prop=pageimages&format=json&pithumbsize=240&origin=*`
    const res = await fetch(url, { next: { revalidate: 86400 * 30 } })
    if (!res.ok) return null
    const json = await res.json()
    const pages = json?.query?.pages ?? {}
    const page = Object.values(pages)[0] as Record<string, unknown>
    const thumb = page?.thumbnail as { source?: string } | undefined
    return thumb?.source ?? null
  } catch {
    return null
  }
}

// ── LLM generation ───────────────────────────────────────────────────────────

async function generateGenreHistory(genreName: string): Promise<GenreHistory> {
  const { text } = await generateText({
    model: getModel(),
    prompt: `You are a music historian. Generate a JSON object describing the history of the "${genreName}" genre. Output ONLY valid JSON, no markdown, no explanation.

Required shape:
{
  "genre": "display name of the genre",
  "originEra": "decade range like '1910s–1920s'",
  "originPlace": "specific city and region, not just a country",
  "culturalContext": "2–3 sentences on the social/cultural conditions that created this genre. Be specific.",
  "pioneers": [
    {
      "name": "full real name",
      "years": "active decades e.g. '1940s–1960s'",
      "role": "one sentence on their specific contribution",
      "imageQuery": "Wikipedia article title for this person"
    }
  ],
  "lineage": [
    {
      "year": 1920,
      "label": "person, place, album, or movement (max 40 chars)",
      "note": "very short phrase (max 80 chars)"
    }
  ]
}

Rules:
- pioneers: 2–5 real, verifiable people only
- lineage: 4–8 nodes, chronological from origin to present
- Be accurate. Do not invent people or events.
- Output ONLY the JSON object, nothing else.`,
    maxOutputTokens: 1200,
  })

  // Strip any accidental markdown code fences
  const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  const parsed = GenreHistorySchema.parse(JSON.parse(clean))

  // Fetch Wikimedia images for pioneers
  const pioneersWithImages = await Promise.all(
    parsed.pioneers.map(async (p) => ({
      ...p,
      imageUrl: await fetchWikimediaImage(p.imageQuery),
    }))
  )

  return { ...parsed, pioneers: pioneersWithImages }
}

// ── Supabase cache ───────────────────────────────────────────────────────────

const CACHE_TTL_DAYS = 30  // genre history is stable, cache for a month

function slugify(genre: string) {
  return genre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

async function readCachedGenreHistory(genre: string): Promise<GenreHistory | null> {
  const supabase = getSupabaseAdminClient()
  if (!supabase) return null

  const slug = slugify(genre)
  const { data } = await supabase
    .from('genre_history_cache')
    .select('history_json, generated_at')
    .eq('genre_slug', slug)
    .single()

  if (!data) return null

  const ageMs = Date.now() - new Date(data.generated_at).getTime()
  if (ageMs > CACHE_TTL_DAYS * 24 * 60 * 60 * 1000) return null

  return data.history_json as GenreHistory
}

async function writeCachedGenreHistory(genre: string, history: GenreHistory) {
  const supabase = getSupabaseAdminClient()
  if (!supabase) return

  const slug = slugify(genre)
  await supabase.from('genre_history_cache').upsert({
    genre_slug: slug,
    genre_name: history.genre,
    history_json: history,
    generated_at: new Date().toISOString(),
  })
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function getGenreHistory(genre: string): Promise<GenreHistory> {
  const cached = await readCachedGenreHistory(genre)
  if (cached) return cached

  const history = await generateGenreHistory(genre)
  await writeCachedGenreHistory(genre, history)
  return history
}

export async function getGenreHistories(genres: string[]): Promise<GenreHistory[]> {
  // Cap at 3 genres and generate in parallel
  const top3 = genres.slice(0, 3)
  const results = await Promise.allSettled(top3.map(g => getGenreHistory(g)))

  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`[genre-history] Failed to generate history for "${top3[i]}":`, r.reason)
    }
  })

  return results
    .filter((r): r is PromiseFulfilledResult<GenreHistory> => r.status === 'fulfilled')
    .map(r => r.value)
}
