import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import type { EscapeRecommendation } from "@/lib/escape/pipeline"

const CACHE_TTL_MS = 24 * 60 * 60 * 1000  // 24 hours

export async function readCachedEscapeRecs(
  userId: string,
): Promise<EscapeRecommendation[] | null> {
  const supabase = getSupabaseAdminClient()
  if (!supabase) return null

  const { data } = await supabase
    .from("escape_cache")
    .select("recommendations, generated_at")
    .eq("spotify_user_id", userId)
    .maybeSingle()

  if (!data) return null

  const ageMs = Date.now() - new Date(data.generated_at).getTime()
  if (ageMs > CACHE_TTL_MS) return null

  return isValidEscapeRecommendations(data.recommendations)
    ? data.recommendations
    : null
}

export async function writeCachedEscapeRecs(
  userId: string,
  recommendations: EscapeRecommendation[],
): Promise<void> {
  const supabase = getSupabaseAdminClient()
  if (!supabase) return

  await supabase.from("escape_cache").upsert({
    spotify_user_id: userId,
    recommendations,
    generated_at: new Date().toISOString(),
  })
}

function isValidEscapeRecommendations(value: unknown): value is EscapeRecommendation[] {
  return (
    Array.isArray(value) &&
    value.every(
      (rec) =>
        rec &&
        typeof rec === "object" &&
        (rec as Partial<EscapeRecommendation>).recommendationVersion === 2,
    )
  )
}
