export default function EscapeLoading() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-5 py-8 sm:px-8">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="h-3 w-24 animate-pulse rounded-full bg-white/10" />
        <div className="h-10 w-64 animate-pulse rounded-2xl bg-white/10" />
        <div className="h-3 w-96 animate-pulse rounded-full bg-white/10" />
      </div>

      {/* Genre sections */}
      {[1, 2, 3].map((i) => (
        <section key={i} className="flex flex-col gap-5">
          <div className="h-4 w-20 animate-pulse rounded-full bg-white/10" />
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2].map((j) => (
              <div
                key={j}
                className="flex flex-col gap-4 rounded-[24px] border border-white/10 p-5"
              >
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 animate-pulse rounded-full bg-white/10" />
                  <div className="flex flex-col gap-2">
                    <div className="h-4 w-32 animate-pulse rounded-full bg-white/10" />
                    <div className="h-3 w-24 animate-pulse rounded-full bg-white/10" />
                  </div>
                </div>
                <div className="h-14 animate-pulse rounded-2xl bg-white/10" />
                <div className="h-1.5 animate-pulse rounded-full bg-white/10" />
              </div>
            ))}
          </div>
        </section>
      ))}

      <p className="text-center text-sm text-[var(--text-muted)]">
        Searching Spotify for artists outside your bubble…
      </p>
    </main>
  )
}
