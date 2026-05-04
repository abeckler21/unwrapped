create table if not exists public.genre_history_cache (
  genre_slug     text primary key,            -- normalized genre name, e.g. "jazz"
  genre_name     text not null,               -- display name, e.g. "Jazz"
  history_json   jsonb not null,              -- full GenreHistory object
  generated_at   timestamptz not null default now()
);
