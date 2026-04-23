import Link from "next/link";

const v1Checklist = [
  "Spotify PKCE auth with secure cookies",
  "Typed Spotify profile and 24h cache layer",
  "Filter Bubble Score with explanations",
  "Dashboard that ties personal listening to macro trends",
  "Public share route and OG card generation",
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
      <section className="hero-grid panel panel-glow overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <p className="eyebrow">Unwrapped v1: The Mirror</p>
          <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-tight text-[var(--text-strong)] sm:text-6xl lg:text-7xl">
            Spotify Wrapped tells you what you heard.
            <span className="block text-[var(--accent)]">This asks why you keep hearing it.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--text-muted)] sm:text-lg">
            Unwrapped is the dark side of Wrapped: a dashboard about repetition, concentration, and the quiet pressure of recommendation systems.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard" className="button-primary">
              Open v1 dashboard
            </Link>
            <Link href="/share/demo-user" className="button-secondary">
              View share preview
            </Link>
          </div>
        </div>

        <div className="relative z-10 grid gap-4">
          <div className="rounded-[28px] border border-white/10 bg-black/25 p-5 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--text-muted)]">This week</p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--text-strong)]">Working v1 target</h2>
            <ul className="mt-5 space-y-3">
              {v1Checklist.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-7 text-[var(--text-soft)]">
                  <span className="mt-2 h-2 w-2 rounded-full bg-[var(--accent)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="panel">
          <p className="eyebrow">Personal</p>
          <h2 className="text-2xl font-semibold text-[var(--text-strong)]">What your score can defend</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
            Genre concentration, artist repetition, popularity skew, and temporal consistency give the first version a readable core instead of a black-box number.
          </p>
        </article>

        <article className="panel">
          <p className="eyebrow">Systemic</p>
          <h2 className="text-2xl font-semibold text-[var(--text-strong)]">Why macro charts matter</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
            A personal stat only becomes meaningful when it is set against the larger industry drift toward shorter, narrower, safer music.
          </p>
        </article>

        <article className="panel">
          <p className="eyebrow">Bridge</p>
          <h2 className="text-2xl font-semibold text-[var(--text-strong)]">Where v1 is headed next</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
            The current dashboard uses seeded data so we can build and verify the interface and scoring engine before wiring real Spotify auth and Supabase caching.
          </p>
        </article>
      </section>
    </main>
  );
}
