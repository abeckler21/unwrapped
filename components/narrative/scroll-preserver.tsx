"use client"

import { useEffect } from "react"

const STORAGE_KEY = "story-scroll-y"

export function ScrollPreserver() {
  // Restore scroll position on mount, then clear the saved value
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (saved) {
      const y = parseInt(saved, 10)
      if (!isNaN(y)) window.scrollTo({ top: y, behavior: "instant" })
      sessionStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  // Keep sessionStorage up-to-date on every scroll (debounced).
  // This fires for both soft Next.js navigation and hard browser navigation,
  // unlike beforeunload which only fires on tab close / full page reload.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    function handleScroll() {
      clearTimeout(timer)
      timer = setTimeout(() => {
        sessionStorage.setItem(STORAGE_KEY, String(window.scrollY))
      }, 150)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return null
}
