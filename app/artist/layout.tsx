import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Analyze — Unwrapped",
  description: "Deep-dive into an artist's career arc or autopsy any public Spotify playlist.",
}

export default function ArtistLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
