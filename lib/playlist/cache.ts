import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import type { PlaylistAutopsy } from "./autopsy"

const TTL_HOURS = 6

export async function readCachedPlaylistAutopsy(
  playlistId: string,
): Promise<PlaylistAutopsy | null> {
  const supabase = getSupabaseAdminClient()
  if (!supabase) return null

  const cutoff = new Date(Date.now() - TTL_HOURS * 60 * 60 * 1000).toISOString()
  const { data } = await supabase
    .from("playlist_cache")
    .select("analysis")
    .eq("playlist_id", playlistId)
    .gte("cached_at", cutoff)
    .single()

  return (data?.analysis as PlaylistAutopsy) ?? null
}

export async function writeCachedPlaylistAutopsy(
  playlistId: string,
  analysis: PlaylistAutopsy,
): Promise<void> {
  const supabase = getSupabaseAdminClient()
  if (!supabase) return

  await supabase.from("playlist_cache").upsert(
    { playlist_id: playlistId, analysis, cached_at: new Date().toISOString() },
    { onConflict: "playlist_id" },
  )
}
