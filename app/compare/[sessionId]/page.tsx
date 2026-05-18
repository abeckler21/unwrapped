import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BreakdownBars } from "@/components/compare/breakdown-bars";
import { OverlapSection } from "@/components/compare/overlap-section";
import { ScoreDuel } from "@/components/compare/score-duel";
import { ShareLink } from "@/components/compare/share-link";
import { ListeningProfileChart } from "@/components/visualizations/listening-profile-chart";
import { computeBubbleScore } from "@/lib/analysis/bubble-score";
import { computeListeningProfile } from "@/lib/analysis/listening-profile";
import { readCachedSpotifyProfile } from "@/lib/cache/spotify-profile-cache";
import {
  buildVerdict,
  computeArtistOverlap,
  computeDivergenceScore,
  computeGenreOverlap,
} from "@/lib/compare/analysis";
import { readCompareSession } from "@/lib/compare/sessions";
import { getCurrentSpotifyProfile } from "@/lib/spotify/current-profile";
import { getSpotifySession } from "@/lib/spotify/session";

type Props = {
  params: Promise<{ sessionId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sessionId } = await params
  return {
    title: `Compare · ${sessionId.slice(0, 8)} — Unwrapped`,
    description: "Two algorithmic profiles, head-to-head. See whose taste the algorithm has shaped more.",
  }
}

export default async function CompareSessionPage({ params }: Props) {
  const { sessionId } = await params;

  // ── Load the compare session ─────────────────────────────────────────────
  const compareSession = await readCompareSession(sessionId);

  if (!compareSession) {
    notFound();
  }

  // Check expiry
  if (new Date(compareSession.expiresAt) < new Date()) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-84px)] w-full max-w-2xl flex-col justify-center px-5 py-12 sm:px-8">
        <div className="panel p-8 text-center">
          <p className="text-2xl font-semibold text-[var(--text-strong)]">Link expired</p>
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            This comparison link was valid for 7 days. Ask your friend to share a new one.
          </p>
          <Link href="/compare" className="button-primary mt-6 inline-flex">
            Create your own link
          </Link>
        </div>
      </main>
    );
  }

  // ── Load initiator profile early (needed for both auth states) ─────────
  const initiatorProfile = await readCachedSpotifyProfile(
    compareSession.initiatorUserId,
    { ignoreTtl: true },
  );

  // ── Check who the current visitor is ────────────────────────────────────
  const session = await getSpotifySession();
  const viewerUserId = session.spotifyUserId;

  // Not logged in → show the initiator's data with a login CTA
  if (!viewerUserId) {
    if (!initiatorProfile) {
      return (
        <main className="mx-auto flex min-h-[calc(100vh-84px)] w-full max-w-2xl flex-col justify-center px-5 py-12 sm:px-8">
          <div className="panel p-8 text-center">
            <p className="text-2xl font-semibold text-[var(--text-strong)]">Waiting for your friend</p>
            <p className="mt-3 text-sm text-[var(--text-muted)]">
              The person who shared this link hasn&apos;t loaded their dashboard yet.
              Ask them to visit their dashboard first, then try again.
            </p>
          </div>
        </main>
      );
    }

    const scoreA = computeBubbleScore(initiatorProfile, "medium_term");
    const nameA = initiatorProfile.displayName || "Them";
    const topGenres = scoreA.genreDistribution.slice(0, 3).map((g) => g.genre);

    return (
      <main className="mx-auto flex min-h-[calc(100vh-84px)] w-full max-w-2xl flex-col justify-center px-5 py-12 sm:px-8">
        <div className="panel panel-glow flex flex-col gap-8 p-8 sm:p-10">
          <div>
            <p className="eyebrow">Comparative Mode</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--text-strong)]">
              {nameA} wants to compare with you
            </h1>
          </div>

          {/* Side-by-side preview: one real score, one placeholder */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center">
              <p className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)]">{nameA}</p>
              <p
                className="font-semibold leading-none tabular-nums text-[var(--text-strong)]"
                style={{ fontSize: "clamp(3rem,12vw,5rem)" }}
              >
                {Math.round(scoreA.score)}
              </p>
              <p className="text-sm font-medium text-[var(--accent)]">{scoreA.tier}</p>
              {topGenres.length > 0 && (
                <p className="mt-1 text-xs text-[var(--text-muted)]">{topGenres.join(" · ")}</p>
              )}
            </div>
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center opacity-50">
              <p className="text-xs font-medium uppercase tracking-widest text-[var(--text-muted)]">You</p>
              <p
                className="font-semibold leading-none tabular-nums text-[var(--text-muted)]"
                style={{ fontSize: "clamp(3rem,12vw,5rem)" }}
              >
                ?
              </p>
              <p className="text-sm text-[var(--text-muted)]">Log in to reveal</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/api/auth/login" className="button-primary text-center">
              Log in with Spotify to compare
            </Link>
            <p className="text-center text-xs text-[var(--text-muted)]">
              You&apos;ll see shared artists, genre overlap, and who is more algorithmically captured.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ── Viewer is the initiator → show their own link ────────────────────────
  if (viewerUserId === compareSession.initiatorUserId) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-84px)] w-full max-w-2xl flex-col justify-center px-5 py-12 sm:px-8">
        <div className="panel panel-glow p-8 sm:p-10">
          <p className="eyebrow">Comparative Mode</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text-strong)]">
            This is your compare link
          </h1>
          <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
            Share it with a friend. When they open it and log in, you&apos;ll
            both see the comparison here.
          </p>
          <div className="mt-8">
            <ShareLink sessionId={sessionId} />
          </div>
          <Link href="/dashboard" className="button-secondary mt-6 inline-flex text-sm">
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  // ── Load both profiles ───────────────────────────────────────────────────
  // initiatorProfile already loaded above; just need the viewer's profile.
  const { profile: viewerProfile, usingDemoData } = await getCurrentSpotifyProfile();

  if (!initiatorProfile) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-84px)] w-full max-w-2xl flex-col justify-center px-5 py-12 sm:px-8">
        <div className="panel p-8 text-center">
          <p className="text-2xl font-semibold text-[var(--text-strong)]">
            Waiting for your friend
          </p>
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            The person who shared this link hasn&apos;t loaded their dashboard yet,
            so their profile isn&apos;t in the cache. Ask them to visit their dashboard
            first, then come back here.
          </p>
          <Link href="/dashboard" className="button-secondary mt-6 inline-flex text-sm">
            Go to my dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (usingDemoData) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-84px)] w-full max-w-2xl flex-col justify-center px-5 py-12 sm:px-8">
        <div className="panel p-8 text-center">
          <p className="text-2xl font-semibold text-[var(--text-strong)]">
            Your session expired
          </p>
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            We couldn&apos;t load your Spotify profile. Please log in again to continue.
          </p>
          <Link href="/api/auth/login" className="button-primary mt-6 inline-flex">
            Log in with Spotify
          </Link>
        </div>
      </main>
    );
  }

  // ── Compute everything ───────────────────────────────────────────────────
  const scoreA = computeBubbleScore(initiatorProfile, "medium_term");
  const scoreB = computeBubbleScore(viewerProfile, "medium_term");
  const profileA = computeListeningProfile(initiatorProfile, "medium_term");
  const profileB = computeListeningProfile(viewerProfile, "medium_term");

  const artistOverlap = computeArtistOverlap(initiatorProfile, viewerProfile);
  const genreOverlap  = computeGenreOverlap(scoreA, scoreB);
  const divergence    = computeDivergenceScore(scoreA, scoreB);

  const nameA = initiatorProfile.displayName || "Them";
  const nameB = viewerProfile.displayName || "You";

  const verdict = buildVerdict(nameA, nameB, scoreA, scoreB, divergence);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-10 sm:px-8">
      {/* Header */}
      <div>
        <p className="eyebrow">Comparative Mode</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text-strong)] sm:text-3xl">
          {nameA} vs {nameB}
        </h1>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Based on 6-month listening profiles · Divergence score:{" "}
          <span className="text-[var(--text-soft)]">{divergence}/100</span>
        </p>
      </div>

      {/* Score duel */}
      <ScoreDuel
        nameA={nameA}
        nameB={nameB}
        scoreA={scoreA}
        scoreB={scoreB}
        verdict={verdict}
      />

      {/* Sub-score breakdown */}
      <BreakdownBars
        nameA={nameA}
        nameB={nameB}
        scoreA={scoreA}
        scoreB={scoreB}
      />

      {/* Listening Profiles */}
      <section className="panel p-6 sm:p-8">
        <p className="eyebrow">Listening Profiles</p>
        <h2 className="mt-1 text-lg font-semibold text-[var(--text-strong)]">
          Profile shape — who listens more algorithmically?
        </h2>
        <p className="mt-1 mb-5 text-xs text-[var(--text-muted)]">
          Based on song lengths, release dates, and genre breadth. Larger polygon = more algorithmic shape.
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-medium text-[var(--text-soft)]">{nameA}</p>
            <ListeningProfileChart profile={profileA} userLabel={nameA} size={220} />
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-medium text-[var(--text-soft)]">{nameB}</p>
            <ListeningProfileChart profile={profileB} userLabel={nameB} size={220} />
          </div>
        </div>
      </section>

      {/* Overlap */}
      <OverlapSection
        nameA={nameA}
        nameB={nameB}
        artists={artistOverlap}
        genres={genreOverlap}
      />

      {/* Footer */}
      <div className="flex gap-3 pt-2">
        <Link href="/dashboard" className="button-secondary text-sm">
          My dashboard
        </Link>
        <Link href="/compare" className="button-secondary text-sm">
          Create my own link
        </Link>
      </div>
    </main>
  );
}
