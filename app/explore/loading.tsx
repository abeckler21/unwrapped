function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/[0.07] ${className}`} />;
}

export default function ExploreLoading() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-10 sm:px-8 lg:px-10">
      {/* Hero */}
      <div className="max-w-2xl">
        <SkeletonBlock className="h-3 w-36" />
        <SkeletonBlock className="mt-3 h-10 w-64" />
        <div className="mt-4 flex flex-col gap-2">
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-4/5" />
          <SkeletonBlock className="h-4 w-3/5" />
        </div>
      </div>

      {/* Context cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="panel p-5">
            <SkeletonBlock className="h-8 w-12" />
            <SkeletonBlock className="mt-3 h-5 w-36" />
            <div className="mt-2 flex flex-col gap-1.5">
              <SkeletonBlock className="h-3 w-full" />
              <SkeletonBlock className="h-3 w-4/5" />
            </div>
          </div>
        ))}
      </div>

      {/* Map placeholder */}
      <section>
        <SkeletonBlock className="mb-6 h-7 w-64" />
        <SkeletonBlock className="h-[420px] w-full rounded-2xl" />
      </section>

      {/* Chart placeholder */}
      <section>
        <SkeletonBlock className="mb-2 h-7 w-80" />
        <SkeletonBlock className="mb-6 h-4 w-2/3" />
        <div className="panel p-4 sm:p-6">
          <SkeletonBlock className="h-64 w-full rounded-xl" />
        </div>
      </section>
    </main>
  );
}
