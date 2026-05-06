CREATE TABLE IF NOT EXISTS public.playlist_cache (
  playlist_id   text        PRIMARY KEY,
  analysis      jsonb       NOT NULL,
  cached_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.playlist_cache ENABLE ROW LEVEL SECURITY;
