import { redirect } from "next/navigation"
import { getSpotifySession } from "@/lib/spotify/session"
import { EmbedGenerator } from "@/components/widgets/embed-generator"
import { env } from "@/lib/env"

export const metadata = {
  title: "Embeddable Widgets — Unwrapped",
  description: "Embed your Unwrapped stats anywhere: Bubble Score Badge, Sonic Fingerprint Radar, and Genre Distribution Ring.",
}

export default async function WidgetsPage() {
  const session = await getSpotifySession()

  if (!session.spotifyUserId || !session.accessToken) {
    redirect("/api/auth/login")
  }

  const baseUrl = env.NEXT_PUBLIC_BASE_URL

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-5 py-8 sm:px-8 lg:px-10">
      <div>
        <p className="eyebrow">Your Unwrapped</p>
        <h1 className="mt-2 text-3xl font-bold text-[var(--text-strong)] sm:text-4xl">
          Embeddable Widgets
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-7 text-[var(--text-muted)]">
          Three widgets, two themes, one iframe. Paste the embed code anywhere you can drop HTML —
          a personal site, a blog, or a Notion page. Your stats update automatically when you
          revisit Unwrapped.
        </p>
      </div>

      <div className="panel p-6 sm:p-8">
        <EmbedGenerator userId={session.spotifyUserId} baseUrl={baseUrl} />
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-6 py-4">
        <p className="text-xs leading-6 text-[var(--text-muted)]">
          <span className="font-medium text-[var(--text-soft)]">Privacy: </span>
          Widgets read from your cached Spotify data — no new API calls on each embed load.
          Widgets are publicly accessible at their URL; anyone with the link can view them.
          Your Spotify data is not re-fetched by the widget.
        </p>
      </div>
    </main>
  )
}
