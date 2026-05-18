"use client"

import { useEffect } from "react"

const STORAGE_KEY = "story-scroll-y"

export function ScrollPreserver() {
  // Restore scroll position on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (saved) {
      const y = parseInt(saved, 10)
      if (!isNaN(y)) window.scrollTo({ top: y, behavior: "instant" })
      sessionStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  // Save scroll position on unload (navigate away)
  useEffect(() => {
    function handleBeforeUnload() {
      sessionStorage.setItem(STORAGE_KEY, String(window.scrollY))
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [])

  return null
}
