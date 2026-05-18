import { getOrGenerateArchetype } from "@/lib/ai/archetype";
import type { BubbleScoreResult } from "@/lib/analysis/bubble-score";
import type { SpotifyProfile } from "@/lib/types/spotify";

import { InsightShareButton } from "./insight-share-button";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/[0.07] ${className}`} />;
}

export function ArchetypeSkeleton() {
  return (
    <section className="panel panel-glow flex flex-col gap-3 p-6 sm:flex-row sm:items-start sm:gap-8 sm:p-8">
      <div className="shrink-0">
        <SkeletonBlock className="h-3 w-40" />
        <SkeletonBlock className="mt-4 h-8 w-44" />
        <SkeletonBlock className="mt-3 h-4 w-36" />
      </div>
      <div className="flex flex-1 flex-col gap-3 sm:border-l sm:border-white/10 sm:pl-8">
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-11/12" />
        <SkeletonBlock className="h-4 w-2/3" />
      </div>
    </section>
  );
}

interface Props {
  profile: SpotifyProfile;
  usingDemoData: boolean;
  score: BubbleScoreResult;
  shareHref: string;
}

export async function ArchetypeServer({ profile, usingDemoData, score, shareHref }: Props) {
  const archetype = await getOrGenerateArchetype(profile, usingDemoData, score);

  return (
    <section className="panel panel-glow flex flex-col gap-3 p-6 sm:flex-row sm:items-start sm:gap-8 sm:p-8">
      <div className="shrink-0">
        <p className="eyebrow">Your listener archetype</p>
        <p className="mt-1 text-2xl font-semibold text-[var(--accent)]">{archetype.name}</p>
        <p className="mt-2 max-w-44 text-xs leading-5 text-[var(--text-muted)]">
          Based on your 6-month listening profile.
        </p>
        {!usingDemoData && (
          <div className="mt-3">
            <InsightShareButton href={`${shareHref}/archetype`} label="Share archetype" />
          </div>
        )}
      </div>
      <p className="text-sm leading-7 text-[var(--text-muted)] sm:border-l sm:border-white/10 sm:pl-8">
        {archetype.prose}
      </p>
    </section>
  );
}
