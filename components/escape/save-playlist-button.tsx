"use client"

import { useState } from "react"

type Props = {
  trackUris: string[]
}

type Status = "idle" | "saving" | "saved" | "error"

export function SavePlaylistButton({ trackUris }: Props) {
  const [status, setStatus] = useState<Status>("idle")
  const [playlistUrl, setPlaylistUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleSave() {
    if (trackUris.length === 0) return
    setStatus("saving")
    setErrorMsg(null)

    try {
      const res = await fetch("/api/user/escape/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackUris }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`)
      }

      const data = (await res.json()) as { playlistUrl: string }
      setPlaylistUrl(data.playlistUrl)
      setStatus("saved")
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong")
      setStatus("error")
    }
  }

  if (status === "saved" && playlistUrl) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 rounded-2xl border border-green-500/20 bg-green-500/10 px-5 py-3 text-sm text-green-400">
          Playlist saved to your Spotify
        </div>
        <a
          href={playlistUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="button-primary text-sm"
        >
          Open in Spotify →
        </a>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={handleSave}
        disabled={status === "saving" || trackUris.length === 0}
        className="button-primary w-fit disabled:opacity-50"
      >
        {status === "saving" ? "Creating playlist…" : "Save all as Spotify playlist"}
      </button>
      {status === "error" && errorMsg && (
        <p className="text-sm text-red-400">{errorMsg}</p>
      )}
      <p className="text-xs text-[var(--text-muted)]">
        Creates a new playlist in your Spotify library called &ldquo;Escape the Bubble&rdquo;.
        No existing playlists are modified.
      </p>
    </div>
  )
}
