"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { extractPlaylistId } from "@/lib/playlist/autopsy"

export default function PlaylistInputPage() {
  const [input, setInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const id = extractPlaylistId(input)
    if (!id) {
      setError("Paste a Spotify playlist URL or a 22-character playlist ID.")
      return
    }
    setError(null)
    router.push(`/playlist/${id}`)
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-5 py-8 sm:px-8">
      <section>
        <Link
          href="/dashboard"
          className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-[var(--text-soft)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          ← Back to dashboard
        </Link>
        <h1 className="mt-4 text-4xl font-bold text-[var(--text-strong)] sm:text-5xl">
          Playlist Autopsy
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
          Paste any public Spotify playlist URL to get an Algorithm Score, era distribution,
          genre breakdown, and human-vs-algorithm classification.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="panel p-6 flex flex-col gap-4">
        <label className="block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
          Spotify playlist URL or ID
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setError(null)
          }}
          placeholder="https://open.spotify.com/playlist/…"
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-[var(--text-strong)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors"
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button type="submit" className="button-primary w-fit">
          Analyze playlist →
        </button>
      </form>

      <div className="panel p-6 flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
          Try these examples
        </p>
        {[
          { label: "Today's Top Hits (Spotify)", url: "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M" },
          { label: "Hot Country (Spotify)", url: "https://open.spotify.com/playlist/37i9dQZF1DXa7ZOS0gae9M" },
        ].map((ex) => (
          <button
            key={ex.url}
            type="button"
            onClick={() => {
              setInput(ex.url)
              setError(null)
            }}
            className="text-left text-sm text-[var(--text-soft)] hover:text-[var(--accent)] transition-colors"
          >
            {ex.label}
          </button>
        ))}
      </div>
    </main>
  )
}
