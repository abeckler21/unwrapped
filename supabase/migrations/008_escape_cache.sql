-- Caches Escape the Bubble recommendations per user (24h TTL).
-- Run in Supabase Dashboard → SQL Editor.

CREATE TABLE IF NOT EXISTS public.escape_cache (
  spotify_user_id  text        PRIMARY KEY,
  recommendations  jsonb       NOT NULL,
  generated_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.escape_cache ENABLE ROW LEVEL SECURITY;
-- All access via service role key only — no anon/authenticated policies.
