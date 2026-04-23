import Link from "next/link";

import { getMissingSetupItems, hasSpotifyEnv, hasSupabaseEnv } from "@/lib/env";

const spotifySteps = [
  "Create a Spotify app in the Spotify developer dashboard.",
  "Add http://127.0.0.1:3000/api/auth/callback as a redirect URI.",
  "Copy the client ID and client secret into .env.local.",
];

const supabaseSteps = [
  "Create a new Supabase project.",
  "Copy the project URL, anon key, and service role key into .env.local.",
  "Run the migration in supabase/migrations to create the cache tables.",
];

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const spotifyError =
    typeof params.spotify_error === "string" ? params.spotify_error : undefined;
  const missing = getMissingSetupItems();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-5 py-8 sm:px-8 lg:px-10">
      <section className="panel panel-glow">
        <p className="eyebrow">Setup</p>
        <h1 className="mt-3 text-4xl font-semibold text-[var(--text-strong)]">Finish the external services for v1</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--text-muted)]">
          The app scaffold and score engine are already live. This page exists so missing credentials fail gracefully instead of breaking auth routes.
        </p>

        {spotifyError ? (
          <div className="mt-6 rounded-[24px] border border-orange-400/30 bg-orange-500/10 p-4 text-sm text-orange-100">
            Spotify auth returned <strong>{spotifyError}</strong>. Most likely causes are a mismatched redirect URI, missing client credentials, or an expired PKCE state cookie.
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold text-[var(--text-strong)]">Spotify</h2>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                {hasSpotifyEnv() ? "Configured" : "Needed"}
              </span>
            </div>
            <ol className="mt-5 space-y-3 text-sm leading-7 text-[var(--text-soft)]">
              {spotifySteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>

          <article className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold text-[var(--text-strong)]">Supabase</h2>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                {hasSupabaseEnv() ? "Configured" : "Needed"}
              </span>
            </div>
            <ol className="mt-5 space-y-3 text-sm leading-7 text-[var(--text-soft)]">
              {supabaseSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>
        </div>

        <div className="mt-8 rounded-[28px] border border-white/10 bg-black/20 p-5">
          <p className="text-sm leading-7 text-[var(--text-muted)]">
            Missing right now: {missing.join(" and ")}.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/api/auth/login" className="button-primary">
            Try Spotify login
          </Link>
          <Link href="/dashboard" className="button-secondary">
            Keep using demo dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
