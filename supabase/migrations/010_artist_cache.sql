CREATE TABLE IF NOT EXISTS public.artist_cache (
  artist_id   text        PRIMARY KEY,
  analysis    jsonb       NOT NULL,
  cached_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.artist_cache ENABLE ROW LEVEL SECURITY;
