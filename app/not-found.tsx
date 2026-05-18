import Link from "next/link"

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 px-5 py-24 text-center sm:px-8">
      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.2),_rgba(56,189,248,0.08))]">
        <span className="text-3xl font-bold text-[var(--accent)]">?</span>
      </div>

      <div>
        <p className="eyebrow">404</p>
        <h1 className="mt-2 text-4xl font-bold text-[var(--text-strong)]">Page not found</h1>
        <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--text-muted)]">
          This page doesn&apos;t exist — or the link has expired. The algorithm didn&apos;t surface it for a reason.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/dashboard"
          className="button-primary"
        >
          Go to dashboard
        </Link>
        <Link
          href="/"
          className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-[var(--text-soft)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          Home
        </Link>
      </div>
    </main>
  )
}
