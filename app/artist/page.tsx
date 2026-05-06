"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type SearchResult = {
  id: string
  name: string
  genres: string[]
  followers: number
  imageUrl: string | null
}

export default function ArtistSearchPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  function handleInput(value: string) {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.trim().length < 2) {
      setResults([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/user/artist/search?q=${encodeURIComponent(value.trim())}`)
        if (!res.ok) {
          const body = await res.json().catch(() => ({})) as { error?: string }
          if (res.status === 401) {
            setError("Session expired — please log out and log back in.")
          } else {
            setError(body.error ?? `Search failed (${res.status})`)
          }
          setResults([])
          return
        }
        const data = (await res.json()) as { results: SearchResult[] }
        setResults(data.results)
      } catch {
        setError("Network error — check your connection and try again.")
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 350)
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
          Artist Dashboard
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
          Search for any Spotify artist to see their full career arc — song length trends,
          collaboration frequency, popularity trajectory, and Algorithm Optimization Index per album.
        </p>
      </section>

      {/* Search input */}
      <div className="panel p-6">
        <label className="block text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-3">
          Search for an artist
        </label>
        <input
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="e.g. Radiohead, Charli XCX, Kendrick Lamar…"
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-[var(--text-strong)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors"
        />
        {loading && (
          <p className="mt-3 text-xs text-[var(--text-muted)]">Searching…</p>
        )}
        {error && (
          <p className="mt-3 text-xs text-red-400">{error}</p>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="flex flex-col gap-2">
          {results.map((artist) => (
            <button
              key={artist.id}
              type="button"
              onClick={() => router.push(`/artist/${artist.id}`)}
              className="panel flex items-center gap-4 p-4 text-left transition-colors hover:border-[var(--accent)]/40"
            >
              {artist.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={artist.imageUrl}
                  alt={artist.name}
                  className="h-12 w-12 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg font-bold text-[var(--text-muted)]">
                  {artist.name[0]}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-[var(--text-strong)]">{artist.name}</p>
                <p className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
                  {artist.genres.join(", ") || "No genres listed"}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-[var(--text-muted)]">Followers</p>
                <p className="text-sm font-semibold tabular-nums text-[var(--text-strong)]">
                  {artist.followers >= 1_000_000
                    ? `${(artist.followers / 1_000_000).toFixed(1)}M`
                    : artist.followers >= 1_000
                      ? `${Math.round(artist.followers / 1_000)}K`
                      : artist.followers}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {query.length >= 2 && !loading && results.length === 0 && !error && (
        <p className="text-center text-sm text-[var(--text-muted)]">No artists found.</p>
      )}
    </main>
  )
}
