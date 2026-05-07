import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import type { PlaylistAutopsy } from "./autopsy"

const TTL_HOURS = 6
const SCORE_KEYS: Array<keyof PlaylistAutopsy["scoreBreakdown"]> = [
  "nameSignal",
  "ownerSignal",
  "recencySignal",
  "homogeneitySignal",
  "durationConsistency",
]

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

  const analysis = data?.analysis
  return isValidPlaylistAutopsy(analysis) ? analysis : null
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

function isValidPlaylistAutopsy(value: unknown): value is PlaylistAutopsy {
  if (!value || typeof value !== "object") return false

  const analysis = value as Partial<PlaylistAutopsy>

  return (
    analysis.analysisVersion === 3 &&
    Number.isFinite(analysis.algorithmScore) &&
    Number.isFinite(analysis.meanDurationMs) &&
    Array.isArray(analysis.tracks) &&
    Boolean(analysis.scoreBreakdown) &&
    SCORE_KEYS.every((key) => Number.isFinite(analysis.scoreBreakdown?.[key]))
  )
}
