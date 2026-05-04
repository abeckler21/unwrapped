import { generateText } from 'ai'
import { getModel } from '@/lib/ai/client'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

export type VisitRecord = {
  visitedAt: string  // ISO date string
  bubbleScore: number
}

// ── Record a visit ────────────────────────────────────────────────────────────
// One row per calendar day — skip insert if we already logged today.

export async function recordVisit(userId: string, bubbleScore: number): Promise<void> {
  const supabase = getSupabaseAdminClient()
  if (!supabase) return

  const todayUtc = new Date().toISOString().slice(0, 10) // "YYYY-MM-DD"

  const { data: existing } = await supabase
    .from('user_visits')
    .select('id')
    .eq('spotify_user_id', userId)
    .gte('visited_at', `${todayUtc}T00:00:00Z`)
    .limit(1)
    .single()

  if (existing) return  // already logged today

  await supabase.from('user_visits').insert({
    spotify_user_id: userId,
    bubble_score: bubbleScore,
    visited_at: new Date().toISOString(),
  })
}

// ── Fetch visit history ───────────────────────────────────────────────────────

export async function getVisitHistory(userId: string): Promise<VisitRecord[]> {
  const supabase = getSupabaseAdminClient()
  if (!supabase) return []

  const { data } = await supabase
    .from('user_visits')
    .select('visited_at, bubble_score')
    .eq('spotify_user_id', userId)
    .order('visited_at', { ascending: true })
    .limit(30)

  if (!data) return []

  return data.map(row => ({
    visitedAt: row.visited_at,
    bubbleScore: Number(row.bubble_score),
  }))
}

// ── AI trend narrative ────────────────────────────────────────────────────────

export async function generateTrendNarrative(visits: VisitRecord[]): Promise<string | null> {
  if (visits.length < 2) return null

  const first = visits[0]
  const last = visits[visits.length - 1]
  const delta = last.bubbleScore - first.bubbleScore
  const direction = delta > 3 ? 'narrowing' : delta < -3 ? 'opening up' : 'stable'
  const span = visits.length === 2 ? 'two visits' : `${visits.length} visits`

  const scoreList = visits
    .map(v => `${new Date(v.visitedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${v.bubbleScore}`)
    .join(', ')

  const prompt = `You write sharp, data-driven copy for a music analytics app called Unwrapped. A listener's filter bubble score has been tracked across visits. Write exactly 1–2 sentences analyzing the trend. Be direct. Use the numbers.

Score history (oldest → newest): ${scoreList}
Overall trend: ${direction} (${delta > 0 ? '+' : ''}${Math.round(delta)} points over ${span})

Write the 1–2 sentence trend read now.`

  try {
    const { text } = await generateText({
      model: getModel(),
      prompt,
      maxOutputTokens: 100,
    })
    return text.trim()
  } catch {
    const abs = Math.abs(Math.round(delta))
    if (direction === 'stable') {
      return `Your filter bubble score has held steady across ${span} — neither widening nor narrowing.`
    }
    return `Your score has ${direction} by ${abs} points across ${span} — from ${first.bubbleScore} to ${last.bubbleScore}.`
  }
}
