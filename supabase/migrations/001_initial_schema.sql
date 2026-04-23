create table if not exists public.spotify_profile_cache (
  spotify_user_id text primary key,
  profile jsonb not null,
  fetched_at timestamptz not null default now()
);

create table if not exists public.users (
  spotify_id text primary key,
  display_name text,
  refresh_token text,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_analyses (
  id bigint generated always as identity primary key,
  spotify_user_id text not null references public.users(spotify_id) on delete cascade,
  computed_at timestamptz not null default now(),
  bubble_score numeric not null,
  raw_snapshot jsonb not null
);

create table if not exists public.user_visits (
  id bigint generated always as identity primary key,
  spotify_user_id text not null references public.users(spotify_id) on delete cascade,
  visited_at timestamptz not null default now(),
  bubble_score numeric not null
);

create index if not exists spotify_profile_cache_fetched_at_idx
  on public.spotify_profile_cache (fetched_at desc);

create index if not exists user_analyses_user_id_idx
  on public.user_analyses (spotify_user_id, computed_at desc);

create index if not exists user_visits_user_id_idx
  on public.user_visits (spotify_user_id, visited_at desc);
