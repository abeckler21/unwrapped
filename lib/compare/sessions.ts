import { getSupabaseAdminClient } from '@/lib/supabase/admin'

export type CompareSession = {
  id: string
  initiatorUserId: string
  expiresAt: string
}

/** Returns the existing active session for this user, or creates a new one. */
export async function getOrCreateCompareSession(userId: string): Promise<string> {
  const supabase = getSupabaseAdminClient()
  if (!supabase) throw new Error('Supabase not configured')

  // Reuse an existing unexpired session so the same user always gets the same link.
  const { data: existing } = await supabase
    .from('compare_sessions')
    .select('id')
    .eq('initiator_user_id', userId)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing?.id) return existing.id

  const { data, error } = await supabase
    .from('compare_sessions')
    .insert({ initiator_user_id: userId })
    .select('id')
    .single()

  if (error || !data) throw new Error('Failed to create compare session')
  return data.id
}

export async function readCompareSession(sessionId: string): Promise<CompareSession | null> {
  const supabase = getSupabaseAdminClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('compare_sessions')
    .select('id, initiator_user_id, expires_at')
    .eq('id', sessionId)
    .maybeSingle()

  if (error || !data) return null

  return {
    id: data.id,
    initiatorUserId: data.initiator_user_id,
    expiresAt: data.expires_at,
  }
}
