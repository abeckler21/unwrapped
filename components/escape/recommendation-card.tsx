import Image from "next/image"
import { formatDuration } from "@/lib/format"
import type { EscapeRecommendation } from "@/lib/escape/pipeline"

type Props = {
  rec: EscapeRecommendation
}

export function RecommendationCard({ rec }: Props) {
  const { artist, track, antiAlgorithmScore } = rec

  return (
    <article className="flex flex-col gap-5 rounded-[24px] border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/20">

      {/* Artist */}
      <div className="flex items-center gap-4">
        {artist.imageUrl ? (
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full">
            <Image
              src={artist.imageUrl}
              alt={artist.name}
              fill
              sizes="56px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06]">
            <span className="text-lg font-semibold text-[var(--accent)]">
              {artist.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <div className="min-w-0">
          <a
            href={artist.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-base font-semibold text-[var(--text-strong)] hover:text-[var(--accent)] transition-colors"
          >
            {artist.name}
          </a>
          <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
            {artist.genres.slice(0, 3).join(", ") || "genre unclassified"}
          </p>
        </div>

        {/* Anti-algorithm score badge */}
        <div className="ml-auto shrink-0 text-right">
          <p className="text-xl font-semibold tabular-nums text-[var(--accent)]">
            {antiAlgorithmScore}
          </p>
          <p className="text-[10px] text-[var(--text-muted)]">score</p>
        </div>
      </div>

      {/* Track */}
      <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
        {track.albumImageUrl ? (
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
            <Image
              src={track.albumImageUrl}
              alt={track.albumName}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="h-10 w-10 shrink-0 rounded-lg border border-white/10 bg-white/[0.04]" />
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[var(--text-strong)]">{track.name}</p>
          <p className="truncate text-xs text-[var(--text-muted)]">{track.albumName}</p>
        </div>

        <p className="shrink-0 text-xs tabular-nums text-[var(--text-muted)]">
          {formatDuration(track.durationMs)}
        </p>
      </div>

    </article>
  )
}
