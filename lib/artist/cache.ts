import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import type { ArtistAnalysis } from "./analysis"

const TTL_HOURS = 24

export async function readCachedArtistAnalysis(
  artistId: string,
): Promise<ArtistAnalysis | null> {
  const supabase = getSupabaseAdminClient()
  if (!supabase) return null

  const cutoff = new Date(Date.now() - TTL_HOURS * 60 * 60 * 1000).toISOString()
  const { data } = await supabase
    .from("artist_cache")
    .select("analysis")
    .eq("artist_id", artistId)
    .gte("cached_at", cutoff)
    .single()

  return (data?.analysis as ArtistAnalysis) ?? null
}

export async function writeCachedArtistAnalysis(
  artistId: string,
  analysis: ArtistAnalysis,
): Promise<void> {
  const supabase = getSupabaseAdminClient()
  if (!supabase) return

  await supabase.from("artist_cache").upsert(
    { artist_id: artistId, analysis, cached_at: new Date().toISOString() },
    { onConflict: "artist_id" },
  )
}
