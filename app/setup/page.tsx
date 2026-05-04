import Link from "next/link";

import { hasLastFmEnv, hasSpotifyEnv, hasSupabaseEnv } from "@/lib/env";

const spotifySteps = [
  "Create an app in the Spotify developer dashboard.",
  "Add the callback URL as a redirect URI.",
  "Copy the client ID and client secret into your environment variables.",
];

const supabaseSteps = [
  "Create a Supabase project.",
  "Copy the project URL, anon key, and service role key into your environment variables.",
  "Run the migrations in supabase/migrations/ to create the required tables.",
];

const lastFmSteps = [
  "Create a Last.fm API account and generate an API key.",
  "Add LASTFM_API_KEY to your environment variables.",
];

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const spotifyError =
    typeof params.spotify_error === "string" ? params.spotify_error : undefined;
  const detail = typeof params.detail === "string" ? params.detail : undefined;

  const allConfigured = hasSpotifyEnv() && hasSupabaseEnv();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-5 py-8 sm:px-8 lg:px-10">

      <section className="panel panel-glow p-8 sm:p-10">
        <p className="eyebrow">Configuration</p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--text-strong)]">
          {allConfigured ? "Everything is configured" : "Connect external services"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-muted)]">
          Unwrapped needs Spotify for your listening data and Supabase to cache it. Last.fm is optional — it enriches genre data when Spotify withholds it.
        </p>

        {spotifyError && (
          <div className="mt-6 rounded-[24px] border border-orange-400/30 bg-orange-500/10 p-5 text-sm text-orange-100">
            <p>
              Spotify returned <strong>{spotifyError}</strong>. Check that your redirect URI matches exactly and that your client credentials are correct.
            </p>
            {detail && (
              <p className="mt-3 break-words text-orange-50/80">Detail: {detail}</p>
            )}
          </div>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <ServiceCard
            name="Spotify"
            status={hasSpotifyEnv() ? "configured" : "required"}
            steps={spotifySteps}
          />
          <ServiceCard
            name="Supabase"
            status={hasSupabaseEnv() ? "configured" : "required"}
            steps={supabaseSteps}
          />
        </div>

        <div className="mt-4">
          <ServiceCard
            name="Last.fm"
            status={hasLastFmEnv() ? "configured" : "optional"}
            steps={lastFmSteps}
            note="Used to enrich artist genre tags when Spotify's API withholds them. The app works without it, but genre analysis will be less precise."
          />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/api/auth/login" className="button-primary">
            Try Spotify login
          </Link>
          <Link href="/dashboard" className="button-secondary">
            Go to dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}

function ServiceCard({
  name,
  status,
  steps,
  note,
}: {
  name: string;
  status: "configured" | "required" | "optional";
  steps: string[];
  note?: string;
}) {
  const statusLabel = {
    configured: "Configured",
    required: "Required",
    optional: "Optional",
  }[status];

  const statusColor = {
    configured: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
    required: "text-orange-300 border-orange-300/30 bg-orange-400/10",
    optional: "text-[var(--text-muted)] border-white/10 bg-white/[0.04]",
  }[status];

  return (
    <article className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-[var(--text-strong)]">{name}</h2>
        <span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusColor}`}>
          {statusLabel}
        </span>
      </div>
      {note && (
        <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">{note}</p>
      )}
      <ol className="mt-4 space-y-2">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3 text-sm leading-7 text-[var(--text-muted)]">
            <span className="mt-0.5 shrink-0 tabular-nums text-[var(--text-muted)]/50">{i + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </article>
  );
}
