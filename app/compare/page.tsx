import Link from "next/link";
import { redirect } from "next/navigation";

import { ShareLink } from "@/components/compare/share-link";
import { getOrCreateCompareSession } from "@/lib/compare/sessions";
import { getSpotifySession } from "@/lib/spotify/session";

export default async function ComparePage() {
  const session = await getSpotifySession();

  if (!session.spotifyUserId) {
    redirect("/api/auth/login");
  }

  let sessionId: string | null = null;
  let error: string | null = null;

  try {
    sessionId = await getOrCreateCompareSession(session.spotifyUserId);
  } catch {
    error = "Could not create a compare link. Check that Supabase is configured.";
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-84px)] w-full max-w-2xl flex-col justify-center px-5 py-12 sm:px-8">
      <section className="panel panel-glow p-8 sm:p-10">
        <p className="eyebrow">Comparative Mode</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text-strong)] sm:text-4xl">
          Compare your bubble
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
          Share the link below with a friend. When they open it and log in with
          their Spotify account, you&apos;ll both see a side-by-side breakdown —
          bubble scores, shared artists, genre overlap, and who is more
          algorithmically captured.
        </p>

        <div className="mt-8">
          {error ? (
            <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-400">
              {error}
            </p>
          ) : sessionId ? (
            <ShareLink sessionId={sessionId} />
          ) : null}
        </div>

        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="text-xs text-[var(--text-muted)]">
            The link gives read-only access to your public profile snapshot —
            the same data shown on your share page. No write access to your
            Spotify account is granted to your friend.
          </p>
          <div className="mt-4 flex gap-3">
            <Link href="/dashboard" className="button-secondary text-sm">
              Back to dashboard
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
