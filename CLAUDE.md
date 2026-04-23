# CLAUDE.md — Unwrapped

## Project Overview

**Unwrapped** is the dark side of Spotify Wrapped: a data visualization platform that reveals how Spotify's algorithms shape your listening habits, and how the music industry has restructured itself to game those same algorithms. It is built for conscious listeners — people who already care about music and want to understand the invisible forces steering what they hear.

The core thesis: streaming algorithms narrow taste over time, and the music industry has responded by engineering songs to be shorter, hookier, and more algorithmic. Unwrapped makes both of these trends visible — personal and systemic — and bridges them.

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js (App Router) | SSR + static mix, API routes, Vercel-native |
| Styling | Tailwind CSS + custom CSS | Fast iteration, custom viz support |
| Visualizations | D3.js + Recharts | D3 for bespoke custom charts; Recharts for standard ones |
| Database | Supabase (PostgreSQL) | User sessions, cached analyses, pre-loaded macro datasets |
| Auth | Spotify OAuth (PKCE) | Spotify *is* the auth; no Clerk needed |
| Python API | Vercel Python Functions | Audio feature computation via librosa from preview URLs |
| Deployment | Vercel | JS + Python in one repo, zero config |
| MCP Servers | Supabase MCP, Playwright MCP | DB management during dev, E2E OAuth testing |

## Repository Structure (target)

```
unwrapped/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Spotify OAuth flow pages
│   ├── dashboard/              # Personal Algorithmic Profile
│   ├── macro/                  # Industry trend visualizations
│   ├── compare/                # Comparative mode (v3+)
│   ├── artist/[id]/            # Artist Perspective Dashboard (v2+)
│   ├── playlist/[id]/          # Playlist Autopsy (v3+)
│   └── api/                    # Next.js API routes (Spotify proxying, analysis)
├── api/                        # Python Vercel Functions
│   └── audio_features.py       # librosa audio feature computation
├── components/                 # Shared UI components
│   ├── visualizations/         # All chart/viz components
│   └── ui/                     # Generic UI primitives
├── lib/                        # Shared logic
│   ├── spotify/                # Spotify API client + data fetchers
│   ├── analysis/               # Scoring algorithms (bubble score, etc.)
│   └── datasets/               # Macro dataset loaders/processors
├── data/                       # Static macro datasets (Billboard, etc.)
├── supabase/                   # Migrations and schema
└── public/                     # Static assets
```

## Development Commands

```bash
npm run dev          # Start Next.js dev server (port 3000)
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # tsc --noEmit
```

## Environment Variables

```bash
# Spotify OAuth
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/api/auth/callback

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App
NEXT_PUBLIC_BASE_URL=http://127.0.0.1:3000
```

## Spotify Developer App Setup (One-Time, Do This First)

### 1. Create the Spotify App
1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) and log in with your Spotify account
2. Click **"Create app"**
3. Fill in:
   - **App name**: `Unwrapped`
   - **App description**: `Reveals how Spotify's algorithm shapes your listening habits`
   - **Redirect URIs**: Add both:
     - `http://127.0.0.1:3000/api/auth/callback` (development)
     - `https://your-vercel-domain.vercel.app/api/auth/callback` (add this once you have a Vercel URL)
   - **Which API/SDKs are you planning to use?**: Check **Web API**
4. Accept the Terms of Service → click **Save**

### 2. Get Your Credentials
- From your app's dashboard page, click **Settings**
- Copy **Client ID** → goes into `SPOTIFY_CLIENT_ID`
- Click **"View client secret"** → copy it → goes into `SPOTIFY_CLIENT_SECRET`

### 3. Required OAuth Scopes
The app requests these scopes at login:

```
user-top-read              # Top tracks and artists
user-read-recently-played  # Recently played tracks
user-library-read          # Saved tracks
playlist-read-private      # User's playlists (including private)
playlist-read-collaborative
playlist-modify-public     # (v3+) Create "Escape the Bubble" playlists
```

### 4. Development Mode Limit
Your app starts in **development mode**: only 25 users can authenticate. This is fine for a course project and the project fair. If you want to open it up beyond that, submit for Quota Extension via the Spotify developer dashboard (takes ~2 weeks for review, so submit by May 6 if you want it for the fair).

---

## Spotify API Constraints — Read These First

- **Development mode cap**: 25 users max until Spotify reviews and approves the app for extended quota.
- **Audio features endpoint is deprecated**: `GET /audio-features` no longer returns data. Do not use it. Alternatives:
  1. Compute features ourselves via librosa from 30-second preview URLs (v2+ Python pipeline)
  2. Use Spotify's `track.duration_ms`, `track.popularity`, `album.release_date` — all still available
  3. Use public datasets (Kaggle, AcousticBrainz) for macro-level audio feature trends
- **Rate limits**: 30 requests/second per app. Cache aggressively. All Spotify responses should be cached in Supabase with a TTL.
- **Token refresh**: Access tokens expire in 1 hour. Implement refresh token rotation correctly.
- **What IS available**: top tracks/artists (short/medium/long term), recently played (last 50), saved tracks, playlists + their tracks, track metadata (duration, popularity, explicit, markets), artist genres, album type.

## Scoring Algorithms

### Filter Bubble Score (0–100, higher = more algorithmic/narrow)
A composite of:
1. **Genre Concentration** (40%): Herfindahl-Hirschman Index on the user's genre distribution. Monoculture = high score.
2. **Artist Repetition** (25%): What % of listening hours go to top 5 artists vs. long tail?
3. **Temporal Homogeneity** (20%): How similar is short-term taste to all-time taste? High similarity = deep in the loop.
4. **Popularity Skew** (15%): Average popularity score of top tracks. High popularity = algorithmically safe choices.

All sub-scores normalized to 0–100 before weighting. The composite is displayed with a breakdown, not just a number.

### Organic vs. Algorithmic Listening Inference
Spotify doesn't expose play context directly. Infer from:
- Tracks appearing in Discover Weekly / Release Radar playlists (check against user's saved playlists)
- Tracks from Daily Mix playlists (identifiable by name pattern)
- Tracks with high popularity + in multiple algorithmic playlists = likely algorithmically surfaced
- Tracks saved/added to personal playlists explicitly = likely organic
- Always surface this as an estimate with uncertainty language in the UI.

## Key Design Principles

1. **Show your work**: Every score and claim should be expandable into "how we calculated this."
2. **Uncertainty is honest**: The organic/algorithmic split is inferred, not measured. Say so.
3. **Macro makes the personal meaningful**: A stat like "your average song is 2:51" means nothing without "in 2000, the average hit was 4:07."
4. **Visual storytelling over dashboards**: Avoid generic charts. Every visualization should make a specific argument.
5. **Dark aesthetic**: The app is intentionally the "dark side" of Wrapped. Visually lean into that — dark backgrounds, high contrast, slightly unsettling color choices (not playful pastels).

## Database Schema Overview (Supabase)

```sql
-- Cached user analyses (avoid re-fetching Spotify on every visit)
users (id, spotify_id, display_name, access_token, refresh_token, token_expires_at)
user_analyses (id, user_id, computed_at, bubble_score, genre_scores, artist_scores, raw_snapshot jsonb)
user_visits (id, user_id, visited_at, bubble_score)  -- for temporal tracking

-- Pre-loaded macro datasets
macro_song_lengths (year, avg_duration_ms, p25_duration_ms, p75_duration_ms, source)
macro_genres (year, genre, chart_share, source)
macro_intro_times (year, avg_seconds_to_hook, source)  -- how quickly songs hit their hook
macro_artist_longevity (year, avg_charting_weeks, source)

-- Audio features computed via librosa (v2+)
track_audio_features (spotify_track_id, tempo, energy_estimate, computed_at)
```

## Macro Datasets to Source

- **Song length trends**: Billboard Hot 100 historical (Kaggle: `fivethirtyeight/music-trends`, `kcmillersean/billboard-hot-100-1958-2017`)
- **Genre homogenization**: MusicBrainz genre tagging + Billboard genre classifications
- **Hook timing**: Spotify's first-play skip data (not available directly; use academic papers as source for cited figures)
- **Artist catalog changes**: Discogs + MusicBrainz for album/track length trends per artist

## Code Conventions

- TypeScript strict mode throughout. No `any`.
- All Spotify API calls go through `lib/spotify/` — never inline fetch calls in components.
- All analysis/scoring logic goes in `lib/analysis/` — pure functions, fully testable.
- React Server Components by default. Use `"use client"` only for interactive visualizations or auth state.
- Tailwind for layout/spacing. Custom CSS modules for anything visualization-specific.
- Never store Spotify access tokens in localStorage. Use httpOnly cookies via Next.js.
- Cache Spotify responses: write to Supabase on first fetch, read from cache on subsequent visits within 24h.

## Version Progression

See `AGENTS.md` for the full version-by-version goal breakdown.

Current version target: **v1**
