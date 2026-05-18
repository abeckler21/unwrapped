"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function RefreshButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRefresh() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/user/escape/refresh", { method: "POST" })
      if (!res.ok) throw new Error("Refresh failed")
      router.refresh()
    } catch {
      setError("Could not refresh. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleRefresh}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-[var(--text-soft)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-50"
      >
        {loading ? "Refreshing…" : "↺ Refresh recommendations"}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
