import Link from "next/link";
import { notFound } from "next/navigation";

import { BreakdownBars } from "@/components/compare/breakdown-bars";
import { OverlapSection } from "@/components/compare/overlap-section";
import { ScoreDuel } from "@/components/compare/score-duel";
import { ShareLink } from "@/components/compare/share-link";
import { computeBubbleScore } from "@/lib/analysis/bubble-score";
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

  // ── Check who the current visitor is ────────────────────────────────────
  const session = await getSpotifySession();
  const viewerUserId = session.spotifyUserId;

  // Not logged in → prompt to log in, preserving the compare URL as a hint
  if (!viewerUserId) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-84px)] w-full max-w-2xl flex-col justify-center px-5 py-12 sm:px-8">
        <div className="panel panel-glow p-8 sm:p-10">
          <p className="eyebrow">Comparative Mode</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text-strong)]">
            Someone wants to compare with you
          </h1>
          <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
            Log in with your Spotify account to see a side-by-side comparison —
            bubble scores, shared artists, genre overlap, and who is more
            algorithmically captured.
          </p>
          <Link href="/api/auth/login" className="button-primary mt-8 inline-flex">
            Log in with Spotify
          </Link>
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

  // Initiator profile: load from cache (ignoreTtl so older snapshots still work)
  const initiatorProfile = await readCachedSpotifyProfile(
    compareSession.initiatorUserId,
    { ignoreTtl: true },
  );

  // Viewer profile: use getCurrentSpotifyProfile so token refresh is handled
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
