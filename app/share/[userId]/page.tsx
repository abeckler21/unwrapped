import Link from "next/link";
import { notFound } from "next/navigation";

import { readCachedArchetype } from "@/lib/ai/archetype";
import { computeBubbleScore } from "@/lib/analysis/bubble-score";
import { readCachedSpotifyProfile } from "@/lib/cache/spotify-profile-cache";
import { mockProfile } from "@/lib/data/mock-profile";
import { formatDuration, formatPercent } from "@/lib/format";

type SharePageProps = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function SharePage({ params }: SharePageProps) {
  const { userId } = await params;

  const profile =
    userId === mockProfile.userId
      ? mockProfile
      : await readCachedSpotifyProfile(userId, { ignoreTtl: true });

  if (!profile) {
    notFound();
  }

  const score = computeBubbleScore(profile, "medium_term");
  const topGenres = score.genreDistribution.slice(0, 3).map((item) => item.genre);
  const archetype = userId === mockProfile.userId ? null : await readCachedArchetype(userId);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-84px)] w-full max-w-3xl flex-col justify-center px-5 py-10 sm:px-8">
      <section className="panel panel-glow">
        <p className="eyebrow">{profile.displayName}&apos;s Unwrapped snapshot</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--text-strong)]">
          This is <span className="text-[var(--accent)]">{archetype?.name ?? score.tier}</span>
        </h1>

        {archetype && (
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-muted)]">
            {archetype.prose}
          </p>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm text-[var(--text-muted)]">Bubble score</p>
            <p className="mt-2 text-4xl font-semibold text-[var(--text-strong)]">{Math.round(score.score)}</p>
            <p className="mt-2 text-sm text-[var(--text-soft)]">{score.tier}</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm text-[var(--text-muted)]">Top genres</p>
            <p className="mt-2 text-xl font-medium text-[var(--text-strong)]">{topGenres.join(" / ")}</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm text-[var(--text-muted)]">Avg. song length</p>
            <p className="mt-2 text-xl font-medium text-[var(--text-strong)]">
              {formatDuration(score.averageTrackDurationMs)}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-[24px] border border-white/10 bg-black/20 p-5">
          <p className="text-sm leading-7 text-[var(--text-muted)]">
            Estimated listening split: {formatPercent(score.organicRatio)} organic, {formatPercent(score.algorithmicRatio)} algorithmic. This is an inference based on context and popularity signals, not direct Spotify attribution.
          </p>
        </div>

        <div className="mt-8 flex gap-3">
          <Link href="/" className="button-primary">
            See your own Unwrapped
          </Link>
          <Link href="/dashboard" className="button-secondary">
            Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
