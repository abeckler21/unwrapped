function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/[0.07] ${className}`} />;
}

export default function HistoryLoading() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-5 py-8 sm:px-8">
      <section>
        <SkeletonBlock className="h-10 w-44 rounded-full" />
        <SkeletonBlock className="mt-6 h-12 w-72" />
        <div className="mt-5 flex max-w-2xl flex-col gap-3">
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-5/6" />
          <SkeletonBlock className="h-4 w-3/5" />
        </div>
      </section>

      {[0, 1, 2].map((item) => (
        <article key={item} className="panel flex flex-col gap-8 p-6 sm:p-10">
          <div className="border-b border-white/10 pb-6">
            <SkeletonBlock className="h-3 w-28" />
            <SkeletonBlock className="mt-4 h-9 w-48" />
            <SkeletonBlock className="mt-3 h-4 w-64" />
            <div className="mt-5 flex max-w-2xl flex-col gap-3">
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-11/12" />
              <SkeletonBlock className="h-4 w-2/3" />
            </div>
          </div>

          <div>
            <SkeletonBlock className="h-3 w-32" />
            <SkeletonBlock className="mt-4 h-28 w-full rounded-2xl" />
          </div>

          <div>
            <SkeletonBlock className="h-3 w-40" />
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((pioneer) => (
                <div
                  key={pioneer}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <SkeletonBlock className="h-16 w-16 shrink-0" />
                  <div className="flex flex-1 flex-col gap-2">
                    <SkeletonBlock className="h-4 w-3/4" />
                    <SkeletonBlock className="h-3 w-1/2" />
                    <SkeletonBlock className="h-3 w-full" />
                    <SkeletonBlock className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>
      ))}
    </main>
  );
}
