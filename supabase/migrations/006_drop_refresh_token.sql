-- Issue 1.2: Drop plaintext refresh_token from users table.
--
-- Refresh tokens are already stored exclusively in httpOnly session cookies
-- (see lib/spotify/session.ts). No application code writes refresh_token to
-- this column. Dropping it eliminates the plaintext token-at-rest risk.
--
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).

ALTER TABLE public.users DROP COLUMN IF EXISTS refresh_token;
