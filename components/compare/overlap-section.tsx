import type { ArtistOverlapResult, GenreOverlapResult } from "@/lib/compare/analysis";

type Props = {
  nameA: string;
  nameB: string;
  artists: ArtistOverlapResult;
  genres: GenreOverlapResult;
};

function Pill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-[var(--text-soft)]">
      {label}
    </span>
  );
}

function AccentPill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-1 text-xs text-[var(--accent)]">
      {label}
    </span>
  );
}

export function OverlapSection({ nameA, nameB, artists, genres }: Props) {
  const hasSharedArtists = artists.shared.length > 0;
  const hasSharedGenres = genres.shared.length > 0;

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {/* Shared artists */}
      <div className="panel p-6">
        <p className="eyebrow">Shared artists</p>
        {hasSharedArtists ? (
          <>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Both of you have these in your top 20
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {artists.shared.map((a) => (
                <AccentPill key={a.id} label={a.name} />
              ))}
            </div>
            <p className="mt-4 text-xs text-[var(--text-muted)]">
              {artists.overlapPercent}% artist overlap
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            No shared artists in your top 20 — your listening circles don&apos;t overlap at all.
          </p>
        )}
      </div>

      {/* Shared genres */}
      <div className="panel p-6">
        <p className="eyebrow">Shared genres</p>
        {hasSharedGenres ? (
          <>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              In both of your top 8 genres
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {genres.shared.map((g) => (
                <AccentPill key={g} label={g} />
              ))}
            </div>
          </>
        ) : (
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            No genre overlap at all — you inhabit completely different sonic worlds.
          </p>
        )}
      </div>

      {/* What sets them apart */}
      {(genres.onlyA.length > 0 || genres.onlyB.length > 0) && (
        <div className="panel p-6 sm:col-span-2">
          <p className="eyebrow">What sets you apart</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Genres in one profile but not the other
          </p>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-medium text-[var(--text-soft)]">
                Only {nameA}
              </p>
              <div className="flex flex-wrap gap-2">
                {genres.onlyA.length > 0 ? (
                  genres.onlyA.map((g) => <Pill key={g} label={g} />)
                ) : (
                  <p className="text-xs text-[var(--text-muted)]">—</p>
                )}
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs font-medium text-[var(--text-soft)]">
                Only {nameB}
              </p>
              <div className="flex flex-wrap gap-2">
                {genres.onlyB.length > 0 ? (
                  genres.onlyB.map((g) => <Pill key={g} label={g} />)
                ) : (
                  <p className="text-xs text-[var(--text-muted)]">—</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
