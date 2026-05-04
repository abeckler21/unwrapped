import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-5 py-16 sm:px-8 lg:px-10">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="panel panel-glow flex flex-col gap-8 p-8 sm:p-14 lg:p-20">
        <div className="max-w-4xl">
          <p className="eyebrow">Know your listening</p>
          <h1 className="mt-5 text-5xl font-semibold tracking-tight text-[var(--text-strong)] sm:text-6xl lg:text-7xl">
            Spotify Wrapped tells you what you heard.
            <span className="block text-[var(--accent)]">
              This asks why you keep hearing it.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--text-muted)] sm:text-lg">
            Streaming algorithms quietly narrow what you discover. The music industry has restructured itself to game those same algorithms. Unwrapped makes both visible — starting with your own listening data.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/api/auth/login" className="button-primary text-base px-7 py-3.5">
              Log in with Spotify
            </Link>
            <Link href="/dashboard" className="button-secondary text-base px-7 py-3.5">
              See a preview
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section className="grid gap-5 lg:grid-cols-3">
        <article className="panel flex flex-col gap-4 p-7">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
            <span className="text-[var(--accent)] font-bold text-lg">%</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-strong)]">Filter Bubble Score</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              A composite measure of how narrow your listening has become — built from genre concentration, artist repetition, popularity skew, and how much your taste has converged over time. Every sub-score is explained, not hidden.
            </p>
          </div>
        </article>

        <article className="panel flex flex-col gap-4 p-7">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
            <span className="text-[var(--accent)] font-bold text-lg">AI</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-strong)]">Listener Archetype</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              Your listening data, read like a music journalist would. Not a horoscope — a short, direct analysis of your relationship with the algorithm, grounded in your actual numbers.
            </p>
          </div>
        </article>

        <article className="panel flex flex-col gap-4 p-7">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
            <span className="text-[var(--accent)] font-bold text-lg">→</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-strong)]">Genre History</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              The sounds you love came from somewhere specific — a city, a decade, a set of people pushing against what music was supposed to be. Trace the lineage from origin to your artists.
            </p>
          </div>
        </article>
      </section>

      {/* ── Industry context strip ────────────────────────────────── */}
      <section className="panel grid gap-8 p-8 sm:p-10 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <p className="eyebrow">The bigger picture</p>
          <h2 className="mt-3 text-2xl font-semibold text-[var(--text-strong)]">
            It is not just you.
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
            The narrowing is structural. The music industry has engineered its output to perform well inside recommendation systems — shorter songs, earlier hooks, safer sounds. Unwrapped shows you both the personal and the systemic.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 lg:col-span-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="text-3xl font-bold text-[var(--text-strong)] tabular-nums">4:06</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Average hit length in 2000</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="text-3xl font-bold text-[var(--accent)] tabular-nums">2:50</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Average hit length today</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="text-3xl font-bold text-[var(--text-strong)] tabular-nums">↓30%</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">Shrinkage in 25 years</p>
          </div>
        </div>
      </section>

      {/* ── CTA footer ───────────────────────────────────────────── */}
      <section className="flex flex-col items-center gap-5 py-6 text-center">
        <h2 className="text-2xl font-semibold text-[var(--text-strong)]">
          Ready to see what the algorithm has been doing?
        </h2>
        <Link href="/api/auth/login" className="button-primary text-base px-8 py-4">
          Connect your Spotify
        </Link>
        <p className="text-xs text-[var(--text-muted)]">
          Read-only access. We never store your credentials or modify your library.
        </p>
      </section>

    </main>
  );
}
