import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Artist Search — Unwrapped",
  description: "Look up any artist's AOI trend and career discography.",
}

export default function ArtistLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
