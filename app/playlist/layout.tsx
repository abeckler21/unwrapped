import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Playlist Autopsy — Unwrapped",
  description: "Paste any public Spotify playlist URL and see how algorithmically engineered it is.",
}

export default function PlaylistLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
