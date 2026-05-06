export default function PlaylistLoading() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-5 py-8 sm:px-8">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="h-3 w-24 animate-pulse rounded-full bg-white/10" />
        <div className="flex items-center gap-4 mt-3">
          <div className="h-16 w-16 animate-pulse rounded-xl bg-white/10" />
          <div className="flex flex-col gap-2">
            <div className="h-7 w-56 animate-pulse rounded-xl bg-white/10" />
            <div className="h-3 w-36 animate-pulse rounded-full bg-white/10" />
          </div>
        </div>
      </div>

      {/* Score card skeleton */}
      <div className="flex flex-col gap-5 rounded-[24px] border border-white/10 p-6 sm:p-8">
        <div className="h-12 w-24 animate-pulse rounded-2xl bg-white/10" />
        <div className="h-2 w-full animate-pulse rounded-full bg-white/10" />
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-3 w-32 animate-pulse rounded-full bg-white/10" />
              <div className="flex-1 h-1.5 animate-pulse rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      </div>

      {/* Charts skeleton */}
      {[1, 2].map((i) => (
        <div
          key={i}
          className="flex flex-col gap-4 rounded-[24px] border border-white/10 p-6"
        >
          <div className="h-3 w-20 animate-pulse rounded-full bg-white/10" />
          <div className="h-5 w-48 animate-pulse rounded-xl bg-white/10" />
          <div className="h-36 animate-pulse rounded-2xl bg-white/10 mt-2" />
        </div>
      ))}

      <p className="text-center text-sm text-[var(--text-muted)]">
        Fetching and analyzing playlist from Spotify…
      </p>
    </main>
  )
}
