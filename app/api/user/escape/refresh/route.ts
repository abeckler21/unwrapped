import { NextResponse } from "next/server"

import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import { getSpotifySession } from "@/lib/spotify/session"

export async function POST() {
  const session = await getSpotifySession()
  if (!session.spotifyUserId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const supabase = getSupabaseAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 })
  }

  await supabase
    .from("escape_cache")
    .delete()
    .eq("spotify_user_id", session.spotifyUserId)

  return NextResponse.json({ ok: true })
}
