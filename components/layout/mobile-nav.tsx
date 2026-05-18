"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

type Props = {
  hasActiveSession: boolean
}

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", authRequired: false },
  { href: "/story", label: "Story", authRequired: false },
  { href: "/history", label: "History", authRequired: false },
  { href: "/explore", label: "Explore", authRequired: false },
  { href: "/compare", label: "Compare", authRequired: true },
  { href: "/escape", label: "Escape", authRequired: true },
  { href: "/artist", label: "Analyze", authRequired: true },
]

export function MobileNav({ hasActiveSession }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const close = () => setOpen(false)

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  const visibleLinks = NAV_LINKS.filter(
    (l) => !l.authRequired || hasActiveSession,
  )

  return (
    <div className="lg:hidden">
      {/* Hamburger / close button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close navigation" : "Open navigation"}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[var(--text-muted)] transition-colors hover:text-[var(--text-strong)]"
      >
        {open ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer — slides down from header */}
      <div
        className={`fixed left-0 right-0 top-[65px] z-30 border-b border-white/8 bg-[rgba(9,8,14,0.97)] backdrop-blur-xl transition-all duration-200 ${
          open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <nav className="flex flex-col divide-y divide-white/6 px-5">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              className={`py-4 text-base transition-colors ${
                pathname === link.href
                  ? "font-medium text-[var(--accent)]"
                  : "text-[var(--text-soft)] hover:text-[var(--text-strong)]"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="py-4">
            {hasActiveSession ? (
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="button-secondary w-full justify-center text-sm"
                >
                  Log out
                </button>
              </form>
            ) : (
              <Link href="/api/auth/login" className="button-primary w-full justify-center">
                Log in with Spotify
              </Link>
            )}
          </div>
        </nav>
      </div>
    </div>
  )
}
