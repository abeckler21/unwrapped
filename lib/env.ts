import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_BASE_URL: z.string().url().default("http://127.0.0.1:3000"),
  SPOTIFY_CLIENT_ID: z.string().optional(),
  SPOTIFY_CLIENT_SECRET: z.string().optional(),
  SPOTIFY_REDIRECT_URI: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
});

const parsedEnv = envSchema.parse({
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REDIRECT_URI: process.env.SPOTIFY_REDIRECT_URI,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
});

function isNonEmpty(value?: string) {
  return Boolean(value && value.trim().length > 0);
}

export const env = parsedEnv;

export function hasSpotifyEnv() {
  return (
    isNonEmpty(env.SPOTIFY_CLIENT_ID) &&
    isNonEmpty(env.SPOTIFY_CLIENT_SECRET) &&
    isNonEmpty(env.SPOTIFY_REDIRECT_URI)
  );
}

export function hasSupabaseEnv() {
  return (
    isNonEmpty(env.NEXT_PUBLIC_SUPABASE_URL) &&
    isNonEmpty(env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
    isNonEmpty(env.SUPABASE_SERVICE_ROLE_KEY)
  );
}

export function getMissingSetupItems() {
  const missing: string[] = [];

  if (!hasSpotifyEnv()) {
    missing.push("Spotify app credentials");
  }

  if (!hasSupabaseEnv()) {
    missing.push("Supabase project credentials");
  }

  return missing;
}
