"use client"

import { useState } from "react"

type WidgetType = "bubble" | "fingerprint" | "genres"
type Theme = "dark" | "light"

const WIDGET_META: Record<WidgetType, { label: string; width: number; height: number; description: string }> = {
  bubble: {
    label: "Bubble Score Badge",
    width: 400,
    height: 220,
    description: "Your Filter Bubble Score, tier, algorithmic exposure, top genre, and average track length.",
  },
  fingerprint: {
    label: "Sonic Fingerprint Radar",
    width: 320,
    height: 380,
    description: "Radar chart comparing your listening profile to the algorithm's ideal across four axes.",
  },
  genres: {
    label: "Genre Distribution Ring",
    width: 400,
    height: 300,
    description: "Donut chart of your genre footprint with HHI concentration score.",
  },
}

type Props = {
  userId: string
  baseUrl: string
}

export function EmbedGenerator({ userId, baseUrl }: Props) {
  const [activeWidget, setActiveWidget] = useState<WidgetType>("bubble")
  const [theme, setTheme] = useState<Theme>("dark")
  const [copied, setCopied] = useState(false)

  const meta = WIDGET_META[activeWidget]
  const widgetUrl = `${baseUrl}/widget/${userId}/${activeWidget}?theme=${theme}`

  const embedCode = `<iframe
  src="${widgetUrl}"
  width="${meta.width}"
  height="${meta.height}"
  frameborder="0"
  style="border-radius:16px;overflow:hidden;display:block;"
  title="${meta.label} — Unwrapped"
></iframe>`

  async function copy() {
    try {
      await navigator.clipboard.writeText(embedCode)
    } catch {
      const ta = document.createElement("textarea")
      ta.value = embedCode
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Widget type selector */}
      <div className="flex flex-col gap-3">
        <p className="eyebrow">Widget type</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {(Object.keys(WIDGET_META) as WidgetType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setActiveWidget(type)}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                activeWidget === type
                  ? "border-[var(--accent)] bg-[var(--accent)]/10"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20"
              }`}
            >
              <p className="text-sm font-semibold text-[var(--text-strong)]">
                {WIDGET_META[type].label}
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {WIDGET_META[type].description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Theme toggle */}
      <div className="flex flex-col gap-3">
        <p className="eyebrow">Theme</p>
        <div className="flex rounded-full border border-white/10 bg-white/[0.04] p-1 w-fit">
          {(["dark", "light"] as Theme[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              className={
                t === theme
                  ? "rounded-full bg-[var(--accent)] px-6 py-2 text-sm font-semibold text-black capitalize"
                  : "px-6 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-strong)] capitalize"
              }
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Live preview */}
      <div className="flex flex-col gap-3">
        <p className="eyebrow">Preview</p>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <iframe
            key={`${activeWidget}-${theme}`}
            src={widgetUrl}
            width={meta.width}
            height={meta.height}
            style={{
              border: "none",
              borderRadius: "16px",
              display: "block",
              maxWidth: "100%",
            }}
            title={`${meta.label} preview`}
          />
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          {meta.width}&thinsp;&times;&thinsp;{meta.height}px
        </p>
      </div>

      {/* Embed code */}
      <div className="flex flex-col gap-3">
        <p className="eyebrow">Embed code</p>
        <div className="relative">
          <pre
            className="overflow-x-auto rounded-2xl border border-white/10 bg-black/30 p-5 text-xs leading-6 text-[var(--text-soft)]"
            style={{ fontFamily: "monospace" }}
          >
            {embedCode}
          </pre>
          <button
            type="button"
            onClick={copy}
            className="absolute right-3 top-3 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-[var(--text-soft)] transition-colors hover:border-[var(--accent)]/40 hover:text-[var(--text-strong)]"
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          Paste this anywhere you can embed HTML — a personal website, Notion, blog, or profile page.
        </p>
      </div>

      {/* Direct links */}
      <div className="flex flex-col gap-2">
        <p className="eyebrow">Direct widget URLs</p>
        {(Object.keys(WIDGET_META) as WidgetType[]).map((type) => (
          <div key={type} className="flex items-center gap-3 text-xs">
            <span className="w-28 shrink-0 text-[var(--text-muted)]">{WIDGET_META[type].label}</span>
            <a
              href={`${baseUrl}/widget/${userId}/${type}?theme=${theme}`}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-[var(--accent-cool)] hover:underline"
            >
              {baseUrl}/widget/{userId}/{type}
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
