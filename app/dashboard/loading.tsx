function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/[0.07] ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <SkeletonBlock className="h-3 w-32" />
          <SkeletonBlock className="mt-4 h-10 w-72" />
        </div>
        <SkeletonBlock className="h-11 w-24 rounded-full" />
      </div>

      <div className="flex flex-col gap-10">
        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-3">
            <SkeletonBlock className="h-3 w-36" />
            <SkeletonBlock className="h-11 w-80 rounded-full" />
          </div>
        </div>

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

        <section className="grid gap-5 lg:grid-cols-[1fr_272px]">
          <div className="panel panel-glow flex flex-col gap-8 p-8 sm:p-10">
            <div>
              <SkeletonBlock className="h-3 w-48" />
              <SkeletonBlock className="mt-6 h-28 w-44" />
              <SkeletonBlock className="mt-5 h-4 w-full max-w-lg" />
              <SkeletonBlock className="mt-3 h-4 w-4/5 max-w-lg" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((stat) => (
                <div key={stat} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <SkeletonBlock className="h-3 w-20" />
                  <SkeletonBlock className="mt-4 h-8 w-16" />
                  <SkeletonBlock className="mt-3 h-3 w-14" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {[0, 1, 2, 3].map((score) => (
              <div key={score} className="panel flex items-center gap-4 px-5 py-4">
                <div className="flex-1">
                  <SkeletonBlock className="h-4 w-36" />
                  <SkeletonBlock className="mt-3 h-3 w-24" />
                  <SkeletonBlock className="mt-2 h-3 w-40" />
                </div>
                <SkeletonBlock className="h-7 w-10" />
              </div>
            ))}
            <SkeletonBlock className="mt-1 h-12 w-full rounded-full" />
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          {[0, 1].map((card) => (
            <article key={card} className="panel flex flex-col gap-5">
              <div>
                <SkeletonBlock className="h-3 w-32" />
                <SkeletonBlock className="mt-3 h-6 w-56" />
              </div>
              <SkeletonBlock className="h-64 w-full rounded-2xl" />
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
