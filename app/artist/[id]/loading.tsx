export default function ArtistLoading() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-5 py-8 sm:px-8">
      {/* Artist header */}
      <div className="flex flex-col gap-4">
        <div className="h-3 w-24 animate-pulse rounded-full bg-white/10" />
        <div className="flex items-center gap-5 mt-3">
          <div className="h-20 w-20 animate-pulse rounded-full bg-white/10" />
          <div className="flex flex-col gap-3">
            <div className="h-10 w-56 animate-pulse rounded-2xl bg-white/10" />
            <div className="h-3 w-36 animate-pulse rounded-full bg-white/10" />
          </div>
        </div>
      </div>

      {/* Charts skeleton */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex flex-col gap-4 rounded-[24px] border border-white/10 p-6"
        >
          <div className="h-3 w-20 animate-pulse rounded-full bg-white/10" />
          <div className="h-5 w-48 animate-pulse rounded-xl bg-white/10" />
          <div className="h-40 animate-pulse rounded-2xl bg-white/10 mt-2" />
        </div>
      ))}

      <p className="text-center text-sm text-[var(--text-muted)]">
        Fetching artist discography from Spotify…
      </p>
    </main>
  )
}
