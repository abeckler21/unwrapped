"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { extractPlaylistId } from "@/lib/playlist/autopsy"

type Tab = "artist" | "playlist"

type SearchResult = {
  id: string
  name: string
  genres: string[]
  imageUrl: string | null
}

export default function AnalyzePage() {
  const [tab, setTab] = useState<Tab>("artist")

  // Artist state
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Playlist state
  const [playlistInput, setPlaylistInput] = useState("")
  const [playlistError, setPlaylistError] = useState<string | null>(null)

  const router = useRouter()

  function handleArtistInput(value: string) {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.trim().length < 2) {
      setResults([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      setSearchError(null)
      try {
        const res = await fetch(`/api/user/artist/search?q=${encodeURIComponent(value.trim())}`)
        if (!res.ok) {
          const body = await res.json().catch(() => ({})) as { error?: string }
          setSearchError(res.status === 401
            ? "Session expired — please log out and log back in."
            : (body.error ?? `Search failed (${res.status})`))
          setResults([])
          return
        }
        const data = (await res.json()) as { results: SearchResult[] }
        setResults(data.results)
      } catch {
        setSearchError("Network error — check your connection and try again.")
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 350)
  }

  function handlePlaylistSubmit(e: React.FormEvent) {
    e.preventDefault()
    const id = extractPlaylistId(playlistInput)
    if (!id) {
      setPlaylistError("Paste a Spotify playlist URL or a 22-character playlist ID.")
      return
    }
    setPlaylistError(null)
    router.push(`/playlist/${id}`)
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-5 py-8 sm:px-8">

      {/* Header */}
      <section>
        <Link
          href="/dashboard"
          className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-[var(--text-soft)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          ← Back to dashboard
        </Link>
        <h1 className="mt-4 text-4xl font-bold text-[var(--text-strong)] sm:text-5xl">
          Analyze
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
          Deep-dive into an artist&apos;s career arc or autopsy any public playlist.
        </p>
      </section>

      {/* Tab switcher */}
      <div className="flex rounded-full border border-white/10 bg-white/[0.04] p-1 self-start">
        <button
          type="button"
          onClick={() => setTab("artist")}
          aria-pressed={tab === "artist"}
          className={
            tab === "artist"
              ? "rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-black"
              : "px-5 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)]"
          }
        >
          Artist
        </button>
        <button
          type="button"
          onClick={() => setTab("playlist")}
          aria-pressed={tab === "playlist"}
          className={
            tab === "playlist"
              ? "rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-black"
              : "px-5 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)]"
          }
        >
          Playlist
        </button>
      </div>

      {/* ── Artist tab ── */}
      {tab === "artist" && (
        <>
          <div className="panel p-6">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-3">
              Search for an artist
            </p>
            <input
              type="text"
              value={query}
              onChange={(e) => handleArtistInput(e.target.value)}
              placeholder="e.g. Radiohead, Charli XCX, Kendrick Lamar…"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-[var(--text-strong)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors"
            />
            {searching && <p className="mt-3 text-xs text-[var(--text-muted)]">Searching…</p>}
            {searchError && <p className="mt-3 text-xs text-red-400">{searchError}</p>}
          </div>

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
                    <p className="mt-1 truncate text-sm text-[var(--text-muted)]">
                      {artist.genres.join(", ") || "No genres listed"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {query.length >= 2 && !searching && results.length === 0 && !searchError && (
            <p className="text-center text-sm text-[var(--text-muted)]">No artists found.</p>
          )}
        </>
      )}

      {/* ── Playlist tab ── */}
      {tab === "playlist" && (
        <form onSubmit={handlePlaylistSubmit} className="panel p-6 flex flex-col gap-4">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
            Spotify playlist URL or ID
          </p>
          <input
            type="text"
            value={playlistInput}
            onChange={(e) => {
              setPlaylistInput(e.target.value)
              setPlaylistError(null)
            }}
            placeholder="https://open.spotify.com/playlist/…"
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-[var(--text-strong)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-colors"
          />
          {playlistError && <p className="text-xs text-red-400">{playlistError}</p>}
          <button type="submit" className="button-primary w-fit">
            Analyze playlist →
          </button>
        </form>
      )}

    </main>
  )
}
