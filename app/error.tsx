"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 px-5 py-24 text-center sm:px-8">
      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.2),_rgba(56,189,248,0.08))]">
        <span className="text-3xl font-bold text-[var(--accent)]">!</span>
      </div>

      <div>
        <p className="eyebrow">Something went wrong</p>
        <h1 className="mt-2 text-4xl font-bold text-[var(--text-strong)]">Unexpected error</h1>
        <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--text-muted)]">
          The page hit an error it couldn&apos;t recover from. You can try again — if this keeps
          happening, it&apos;s on us.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-[var(--text-muted)]">
            Error ID: {error.digest}
          </p>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="button-primary"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-[var(--text-soft)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  )
}
