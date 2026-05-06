-- Comparative Mode: stores a shareable link token for two-user comparisons.
-- The session only records who initiated the comparison; the viewer's identity
-- is resolved from their own session cookie at page load time.
-- Run in Supabase Dashboard → SQL Editor.

CREATE TABLE IF NOT EXISTS public.compare_sessions (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  initiator_user_id text   NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  expires_at   timestamptz NOT NULL DEFAULT (now() + INTERVAL '7 days')
);

CREATE INDEX IF NOT EXISTS compare_sessions_initiator_idx
  ON public.compare_sessions (initiator_user_id, expires_at DESC);

ALTER TABLE public.compare_sessions ENABLE ROW LEVEL SECURITY;
-- No permissive policies — all access via service role key only.
