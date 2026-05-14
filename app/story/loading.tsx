export default function StoryLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5">
      <div className="mx-auto w-full max-w-2xl space-y-8 text-center">
        <div className="h-3 w-20 animate-pulse rounded-full bg-white/10 mx-auto" />
        <div className="h-12 w-64 animate-pulse rounded-2xl bg-white/8 mx-auto" />
        <div className="space-y-3">
          <div className="h-5 w-full animate-pulse rounded-full bg-white/6" />
          <div className="h-5 w-5/6 animate-pulse rounded-full bg-white/6 mx-auto" />
          <div className="h-5 w-4/6 animate-pulse rounded-full bg-white/6 mx-auto" />
        </div>
        <div className="h-36 animate-pulse rounded-2xl bg-white/[0.03] border border-white/8" />
      </div>
    </div>
  )
}
