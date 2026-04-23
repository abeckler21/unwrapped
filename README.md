# Unwrapped

> The dark side of Spotify Wrapped.

Unwrapped is a class project exploring how streaming algorithms shape music taste — and how the music industry has restructured itself to game those same algorithms. It is built for conscious listeners: people who already care about music and want to understand the invisible forces steering what they hear.

## What It Does

Spotify Wrapped tells you what you listened to. Unwrapped asks *why* — and whether you actually chose it.

Connect your Spotify account and Unwrapped will:

- **Score your filter bubble** — a composite measure of how narrow and homogeneous your listening has become, broken down by genre concentration, artist repetition, popularity skew, and how much your taste has converged over time
- **Estimate your algorithmic exposure** — how much of your listening is likely algorithmically surfaced (Discover Weekly, Daily Mix, autoplay) versus music you actively sought out
- **Show you the macro picture** — industry-wide visualizations of how popular music has changed in the streaming era: shrinking song lengths, earlier hooks, genre homogenization, concentration of streams among fewer artists
- **Bridge the personal and the systemic** — "Your average song is 2:51. In 2005, the average hit was 4:07. Here's how the industry shifted."
- **Help you escape** — recommendations for music outside your algorithmic comfort zone, drawn from genres your listening data suggests the algorithm is filtering out

## Motivation

This project grew out of a simple observation: streaming platforms celebrate consumption but obscure influence. The same recommendation systems that make music discovery effortless also quietly narrow what gets discovered. Meanwhile, the music industry has responded by engineering songs — shorter, hookier, more sonically consistent — to perform well inside those systems. Unwrapped makes both of these trends visible.

As a musician, I wanted to build something that helps people be *conscious* listeners, not passive consumers.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router) |
| Styling | Tailwind CSS + D3.js |
| Database | Supabase (PostgreSQL) |
| Auth | Spotify OAuth 2.0 (PKCE) |
| Audio Analysis | Python / librosa (Vercel Functions) |
| Deployment | Vercel |

## Version Roadmap

This project is developed in four weekly versions over the course of a month:

| Version | Theme | Deadline |
|---|---|---|
| v1 — The Mirror | Core dashboard: filter bubble score, genre analysis, macro trends | Apr 28, 2026 |
| v2 — The Depth | Temporal tracking, audio feature pipeline, artist evolution | May 5, 2026 |
| v3 — The Connection | Comparative mode, Escape the Bubble recommendations, playlist autopsy | May 12, 2026 |
| v4 — The Statement | Narrative mode, Industry Manipulation Index, full polish | May 19, 2026 |

## Limitations & Honesty

- **This is a class project**, not a production service. The Spotify app runs in development mode, capped at 25 authenticated users.
- **The organic/algorithmic split is inferred, not measured.** Spotify's API does not expose why a track was played. We use contextual signals (playlist type, track patterns) to estimate this, and we say so in the UI.
- **Audio features are computed from 30-second previews** using librosa, not from Spotify's deprecated audio features endpoint. Results are estimates.
- Every score in the app includes an explanation of how it was calculated.

## Academic Context

Built for Design Build Ship Spring 2026 at the University of Chicago. Not affiliated with or endorsed by Spotify.

## Setup

See `CLAUDE.md` for the full developer setup guide, including Spotify app registration, Supabase configuration, and environment variables.
