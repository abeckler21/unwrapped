"use client"

import { useState } from "react"

type Props = {
  href: string
  label?: string
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }
  const ta = document.createElement("textarea")
  ta.value = value
  ta.setAttribute("readonly", "")
  ta.style.cssText = "position:fixed;opacity:0"
  document.body.appendChild(ta)
  ta.select()
  document.execCommand("copy")
  document.body.removeChild(ta)
}

export function InsightShareButton({ href, label = "Share" }: Props) {
  const [status, setStatus] = useState<"idle" | "copied">("idle")

  async function handleClick() {
    const url = new URL(href, window.location.origin).toString()
    try {
      await copyText(url)
      setStatus("copied")
      setTimeout(() => setStatus("idle"), 2200)
    } catch {
      // ignore
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-live="polite"
      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] transition-colors hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
    >
      {status === "copied" ? (
        <>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M8 1H9.5A1.5 1.5 0 0111 2.5v7A1.5 1.5 0 019.5 11h-7A1.5 1.5 0 011 9.5V2.5A1.5 1.5 0 012.5 1H4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <rect x="3.5" y="0.5" width="5" height="2.5" rx="0.75" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          {label}
        </>
      )}
    </button>
  )
}
