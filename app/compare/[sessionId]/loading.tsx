export default function CompareLoading() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-10 sm:px-8">
      <div className="flex flex-col gap-2">
        <div className="h-3 w-24 animate-pulse rounded-full bg-white/10" />
        <div className="h-8 w-48 animate-pulse rounded-full bg-white/10" />
      </div>

      {/* Score duel skeleton */}
      <div className="panel p-8">
        <div className="h-3 w-32 animate-pulse rounded-full bg-white/10" />
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-3">
            <div className="h-3 w-20 animate-pulse rounded-full bg-white/10" />
            <div className="h-16 w-28 animate-pulse rounded-2xl bg-white/10" />
            <div className="h-3 w-16 animate-pulse rounded-full bg-white/10" />
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="h-3 w-20 animate-pulse rounded-full bg-white/10" />
            <div className="h-16 w-28 animate-pulse rounded-2xl bg-white/10" />
            <div className="h-3 w-16 animate-pulse rounded-full bg-white/10" />
          </div>
        </div>
        <div className="mt-6 h-2 animate-pulse rounded-full bg-white/10" />
        <div className="mt-6 h-14 animate-pulse rounded-2xl bg-white/10" />
      </div>

      {/* Breakdown skeleton */}
      <div className="panel p-8">
        <div className="h-3 w-28 animate-pulse rounded-full bg-white/10" />
        <div className="mt-6 flex flex-col gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="h-2 w-32 animate-pulse rounded-full bg-white/10" />
              <div className="h-2 animate-pulse rounded-full bg-white/10" />
              <div className="h-2 animate-pulse rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      </div>

      {/* Overlap skeleton */}
      <div className="grid gap-5 sm:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="panel p-6">
            <div className="h-3 w-24 animate-pulse rounded-full bg-white/10" />
            <div className="mt-4 flex flex-wrap gap-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-6 w-20 animate-pulse rounded-full bg-white/10" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
