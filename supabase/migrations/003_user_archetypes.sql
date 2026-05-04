create table if not exists public.user_archetypes (
  spotify_user_id text primary key references public.users(spotify_id) on delete cascade,
  archetype_name  text not null,
  archetype_prose text not null,
  generated_at    timestamptz not null default now()
);
