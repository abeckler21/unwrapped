import type { PlaylistTrack } from "@/lib/playlist/autopsy"

type Props = {
  tracks: PlaylistTrack[]
}

function fmt(ms: number) {
  const s = Math.round(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
}

export function TrackList({ tracks }: Props) {
  return (
    <div className="flex flex-col divide-y divide-white/6">
      {tracks.slice(0, 50).map((track, i) => (
        <div
          key={track.id}
          className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
        >
          {/* Index */}
          <span className="w-6 shrink-0 text-right text-xs tabular-nums text-[var(--text-muted)]">
            {i + 1}
          </span>

          {/* Album art */}
          {track.albumImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={track.albumImageUrl}
              alt={track.albumName}
              className="h-9 w-9 shrink-0 rounded-md object-cover"
            />
          ) : (
            <div className="h-9 w-9 shrink-0 rounded-md bg-white/10" />
          )}

          {/* Track info */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--text-strong)]">
              {track.name}
            </p>
            <p className="truncate text-xs text-[var(--text-muted)]">
              {track.artistNames.join(", ")}
            </p>
          </div>

          {/* Year */}
          <span className="shrink-0 text-xs tabular-nums text-[var(--text-muted)]">
            {track.releaseYear}
          </span>

          {/* Popularity bar */}
          <div className="hidden w-16 sm:flex flex-col gap-1 items-end">
            <div className="h-1 w-full rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[var(--accent)]/50"
                style={{ width: `${track.popularity}%` }}
              />
            </div>
            <span className="text-xs tabular-nums text-[var(--text-muted)]">
              {track.popularity}
            </span>
          </div>

          {/* Duration */}
          <span className="shrink-0 text-xs tabular-nums text-[var(--text-muted)]">
            {fmt(track.durationMs)}
          </span>
        </div>
      ))}
      {tracks.length > 50 && (
        <p className="pt-4 text-center text-xs text-[var(--text-muted)]">
          Showing first 50 of {tracks.length} tracks
        </p>
      )}
    </div>
  )
}
