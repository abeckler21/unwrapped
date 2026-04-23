create table if not exists public.lastfm_artist_tags_cache (
  normalized_artist_name text primary key,
  artist_name text not null,
  raw_tags jsonb not null default '[]'::jsonb,
  normalized_tags jsonb not null default '[]'::jsonb,
  fetched_at timestamptz not null default now()
);

create index if not exists lastfm_artist_tags_cache_fetched_at_idx
  on public.lastfm_artist_tags_cache (fetched_at desc);
