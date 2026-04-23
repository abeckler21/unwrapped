# AGENTS.md — Unwrapped Version Roadmap

## Project Vision

Unwrapped is built in four versions over four weeks. Each version is a shippable, demo-able product — not just a milestone toward something else. Each version gets more analytical depth, more social features, and more visual ambition than the last.

The through-line: **personal listening + systemic industry trends + the bridge between them.** Every version should have all three.

---

## v1 — "The Mirror"
**Theme**: Show the user what they can't see about their own listening.
**Deadline**: Tuesday, April 28, 2026
**Persona**: Someone who just heard about the app from a friend. They log in, feel a moment of recognition or mild discomfort, and want to share one thing.

### Main Goals

#### 1. Spotify OAuth (PKCE Flow)
- Full Authorization Code with PKCE login
- Token storage in httpOnly cookies
- Refresh token rotation
- `/api/auth/login`, `/api/auth/callback`, `/api/auth/logout` routes
- Graceful handling of auth failures and revoked access

#### 2. Data Fetching Layer
- Fetch and normalize: top tracks (short/medium/long term), top artists, recently played (50 tracks), saved tracks (up to 200), user's playlists
- Cache all responses in Supabase with 24h TTL — no repeat Spotify calls on re-visit
- Build a clean `SpotifyProfile` typed object that the rest of the app consumes

#### 3. Filter Bubble Score v1
- **Genre Concentration** (HHI on genre distribution from top artists)
- **Artist Repetition** (top 5 artists as % of total listening weight)
- **Popularity Skew** (mean popularity of top 50 tracks, normalized)
- **Temporal Consistency** (cosine similarity of short-term vs. long-term genre vectors)
- Composite weighted score (0–100), displayed with labeled tier: "Wide Open" / "Narrowing" / "In the Loop" / "Deep in the Algorithm"
- Breakdown panel showing each sub-score with plain-English explanation

#### 4. Algorithmic Profile Dashboard
- Filter Bubble Score as the hero element
- Genre distribution donut chart (top 8 genres + "other")
- Top 5 Artists with mini-profile (follower count, genre tags, popularity)
- Top Tracks grid (cover art, name, artist, duration, popularity bar)
- "Your listening at a glance" — time range toggle (4 weeks / 6 months / all time)
- Estimated organic vs. algorithmic listening ratio (inferred, with disclaimer)

#### 5. Macro Trend Visualizations (Pre-loaded Data)
- **Song Length Over Time** (1960–2024): area chart showing average hit duration shrinking
- **Genre Share Over Time** (1990–2024): stacked bar showing homogenization of chart genres
- **Popularity Concentration** (2000–2024): how many unique artists make up 50% of streams
- All sourced from Billboard + Kaggle datasets, loaded at build time (not runtime API calls)

#### 6. "You Are Here" Connections
- After each macro chart, a callout: "Your average track is X. The 2024 average is Y. In 2005, it was Z."
- "Your top genre accounts for X% of your listening. The most-streamed genre accounts for X% of all streams globally."
- These should feel like personalized annotations on the macro charts, not separate sections

#### 7. Basic Sharing
- "Share your score" button generates a static OG image (via `@vercel/og` or `satori`) containing:
  - Filter Bubble Score + tier label
  - Top 3 genres
  - One standout stat ("Your average song: 2:51")
- Link-shareable: `/share/[userId]` public route shows a read-only view of the user's top-line stats

### Stretch Goals (v1)
- **Diversity Trajectory**: show the three time ranges side-by-side and annotate whether taste is converging or diverging over time
- **Sonic Similarity Heatmap**: a grid of top 20 tracks with similarity scores between each pair (based on shared genres and artist overlap as a proxy for audio similarity until v2's librosa pipeline)
- **Dark Mode / Light Mode toggle** with smooth transition
- **Animated score reveal** on first dashboard load (score counts up dramatically)

### Success Criteria
- A stranger can log in, read their score, understand what it means, and share it — in under 3 minutes
- All Spotify calls are cached; a second page load should be instant
- The app doesn't crash or show errors for any Spotify account (edge cases: no listening history, private playlists, non-US market)
- Score is defensible: a musically homogeneous listener scores high, a broad listener scores low

---

## v2 — "The Depth"
**Theme**: Turn the mirror into a time machine — show how the user got here.
**Deadline**: Tuesday, May 5, 2026
**Persona**: Someone returning to the app after v1. They already know their score. Now they want to understand *why* and explore.

### Main Goals

#### 1. Temporal Analysis — Bubble Score Over Time
- Store `bubble_score` per user visit in `user_visits` table
- Show a line chart of bubble score across visits: "Are you getting more or less algorithmically captured?"
- Annotate inflection points: "This is when you started listening heavily to [genre]"
- First-visit users see a prompt to "come back next week to see your trend"

#### 2. Audio Feature Pipeline (Python/librosa)
- Vercel Python Function at `/api/audio_features`
- Input: Spotify track preview URL (30s clip, still available from the tracks API)
- Compute via librosa: tempo (BPM), estimated energy (RMS), spectral centroid (brightness), zero-crossing rate (noisiness proxy)
- Cache results in `track_audio_features` Supabase table — compute once, store forever
- Expose these in the dashboard as a "Sonic Profile" — a radar chart showing the user's aggregate audio fingerprint

#### 3. Sonic Fingerprint Visualization
- Radar/spider chart: user's aggregate audio profile across dimensions (tempo, energy, brightness, danceability proxy)
- Compare user's fingerprint to the "algorithmically optimized" archetype (high energy, 100-120 BPM, bright, short)
- "Your sound vs. the algorithm's ideal sound" framing

#### 4. Genre Drift Animation
- Animated transition between time ranges (4 weeks → 6 months → all time)
- Visual "drift" showing genres entering/leaving and their weight shifting
- Highlight genres that have increased in short-term vs. long-term (likely algorithmically surfaced)

#### 5. Artist Evolution Tracker
- Pick any artist from the user's top artists
- Pull their full discography (album names, track list, durations) via Spotify
- Show: how average song length has changed album-by-album, popularity trajectory, genre drift in metadata
- Frame: "Has [Artist] changed their sound to stay algorithmically relevant?"
- Visualize as a connected scatterplot: year vs. average song duration, with album art as nodes

#### 6. Enhanced Filter Bubble Score v2
- Add **Audio Homogeneity** sub-score: standard deviation of audio features across top tracks (low SD = sonically narrow)
- Add **Release Date Skew**: are they listening primarily to new releases (algorithmically pushed) vs. catalog?
- Refine weighting based on what's most predictive of algorithmic capture

#### 7. Macro Dataset Expansion
- Add **Average intro length** (seconds before first drop/hook) trend over time
- Add **Explicit content percentage** in charts over time (proxy for edginess declining)
- Add **Collaboration rate** (features/collabs per song) — a known algorithmic signal
- Source: expanded Kaggle datasets, cross-referenced with MusicBrainz

### Stretch Goals (v2)
- **Playlist Autopsy (Beta)**: user pastes a Spotify playlist URL; app scores it for algorithmic optimization vs. diversity (full feature in v3)
- **"What the algorithm is feeding you" panel**: tracks that appear in Discover Weekly / Daily Mix playlists, flagged explicitly
- **Skip rate proxy**: use `recently_played` timestamp clustering to infer which tracks might be getting skipped (short gaps between track-change events)
- **Listening time-of-day heatmap**: when does the user listen? (recent plays timestamps)

### Success Criteria
- The audio feature pipeline processes a track preview in under 5 seconds and caches the result
- A returning user sees their temporal trend without having to do anything
- The artist evolution tracker works for any artist with more than 2 albums in Spotify's catalog
- The sonic fingerprint radar chart is visually distinct enough that two different users' fingerprints look meaningfully different

---

## v3 — "The Connection"
**Theme**: Music is social. Your bubble has a shape — how does it compare to someone else's?
**Deadline**: Tuesday, May 12, 2026
**Persona**: The user wants to show a friend, compare with a partner, or share something more than just a score number.

### Main Goals

#### 1. Comparative Mode
- Two-user comparison: User A shares a link → User B logs in via that link → side-by-side comparison
- Show: overlap coefficient (what % of top artists/genres they share), bubble score comparison, sonic fingerprint overlap
- "Who is more algorithmically captured?" framing with appropriate humility
- Visual: two radar charts overlaid, a Venn diagram of shared artists/genres, divergence score
- Shareable URL: `/compare/[sessionId]` — both users' read-only comparison persists for 7 days

#### 2. "Escape the Bubble" Recommendations
Fully automated pipeline — no manual curation required:

**Step 1 — Gap Detection**: From the user's genre HHI analysis, identify genres that are: (a) well-represented in Spotify's global catalog and (b) underrepresented or absent in the user's profile. These are the "blind spots."

**Step 2 — Candidate Discovery**: For each gap genre, query Spotify's search API (`type=artist&genre=[gap_genre]`). Filter to artists with:
- `popularity` between 20–55 (known enough to be real, unknown enough to be non-algorithmic)
- Not already in the user's top artists or recently played
- At least 500 Spotify followers (not just a test account)

**Step 3 — Anti-Algorithm Scoring**: Score each candidate artist:
- **Popularity penalty** (lower popularity among gap-genre artists = higher score)
- **Catalog depth bonus** (more albums = not a one-hit algorithm play)
- **Genre distance bonus** (how far from user's centroid genre vector, using artist genre tag cosine distance)
- **Recency penalty** (released in last 3 months = likely algorithmically boosted on release; deprioritize)

**Step 4 — Track Selection**: For each top-scoring artist, fetch their top track that is NOT on any algorithmic playlist (infer by checking if it appears in user's algorithmic playlists). Surface that track.

**Output**: 8–10 artist+track pairs, grouped by the gap genre they fill, with an explanation: "You listen to almost no [jazz-funk]. Here's [Artist] — here's why the algorithm probably never showed you them."

**Playlist creation**: Allow user to add any recommendation directly to a new Spotify playlist via write scope (`playlist-modify-public`). Requires requesting this scope at login — present it as optional ("save your escape route").

**Frame**: "If the algorithm is a filter, these are what it's filtering out for you."

#### 3. Full Playlist Autopsy
- Input: any Spotify playlist URL or from the user's library
- Output:
  - **Algorithm Score** (0–100): how algorithmically optimized is this playlist?
  - Genre diversity index
  - Average track popularity vs. catalog diversity
  - Audio feature consistency (is it sonically homogeneous?)
  - Oldest / newest track, era distribution
  - "Who built this playlist — a human or an algorithm?" — classify based on name patterns and track distribution
- Visualizations: timeline, genre wheel, audio fingerprint of the playlist

#### 4. Artist Perspective Dashboard (Full)
- Extended from v2's preview
- For any artist in Spotify: full career arc visualization
- Key metrics tracked album-by-album:
  - Average song duration
  - Average intro length (from audio features)
  - Collaboration frequency
  - Popularity trajectory
  - Genre tag drift (have they "simplified" their genre tags over time?)
- "Algorithm Optimization Index" per album: a composite score of how algorithm-friendly each album is
- Examples pre-loaded for 5 famous artists who visibly changed their sound for streaming

#### 5. Rich Shareable Cards
- Per-insight shareable cards (not just one overall card from v1)
- Each visualization has a "Share this chart" button
- Dynamic OG image generation for each card type
- Cards include: bubble score card, sonic fingerprint card, genre drift card, comparison card, playlist autopsy card
- Custom URL slugs: `/share/[userId]/fingerprint`, `/share/[userId]/genres`, etc.

#### 6. Mobile-Optimized Experience
- All visualizations redesigned for mobile viewport
- Touch-friendly interaction (swipe through insights, tap to expand)
- Condensed mobile dashboard layout
- Share sheet integration on iOS/Android (Web Share API)

### Stretch Goals (v3)
- **"Bubble Burst Challenge"**: weekly email/notification with 3 new recommendations outside the user's bubble; track whether they listen to them
- **Public Genre Explorer**: a no-login page showing macro genre trends, song length evolution, and industry stats — serves as a marketing hook for the app
- **Embeddable Widget (Beta)**: a simple iframe embed showing a user's bubble score, for personal websites or social profiles
- **"Artist Algorithm Report Card"**: a generated text summary (using Claude API) describing how an artist has changed their sound for streaming, in the style of a critical review

### Success Criteria
- Comparative mode works end-to-end: share link → friend logs in → both see comparison within 30 seconds
- Escape the Bubble recommendations feel genuinely different from what Spotify would surface (qualitative bar)
- Playlist Autopsy correctly classifies Discover Weekly and Daily Mixes as "algorithmic" and personal curated playlists as "human"
- All shareable cards render correctly in Twitter/iMessage link previews (OG tags work)

---

## v4 — "The Statement"
**Theme**: This is not just a tool — it's an argument about how music works now.
**Deadline**: Tuesday, May 19, 2026 (Project Fair)
**Persona**: A stranger at a project fair. No prior knowledge of the app. Has 90 seconds. Needs to understand, feel something, and remember it.

### Main Goals

#### 1. Narrative Mode — "The Full Story"
- A guided, linear scroll-through of the user's data, structured as a story
- Chapters: "Where You Are" → "How You Got Here" → "What the Industry Did" → "What You're Missing" → "What to Do About It"
- Each chapter uses scroll-triggered animations (intersection observer) to reveal data progressively
- Inspired by The Pudding's essay format: prose + data woven together
- The entire narrative is personalized ("In the last 4 weeks, you listened to [X]. Here's what that means.")

#### 2. Industry Manipulation Index (IMI)
- Per-track score: how algorithmically optimized is this specific song?
- Components: duration vs. era average, intro length, collaboration indicator, release clustering (part of an algorithmic release pattern?), popularity-to-discovery ratio
- Shown as an overlay on the user's top tracks: "7 of your top 20 tracks score above 80 on the IMI"
- Aggregate: "X% of your listening is algorithmically engineered music"
- This is the most provocative, highest-impact feature — it makes the abstract concrete

#### 3. Embeddable Widgets (Full)
- Three widget types: Bubble Score Badge, Sonic Fingerprint Radar, Genre Distribution Ring
- Clean iframe embed code, copy-paste ready
- Public URL that renders a lightweight, no-auth widget for the user's public stats
- Mobile-responsive, dark + light themes

#### 4. Performance & Scale Hardening
- All macro datasets served from edge cache (Vercel Edge Config or CDN-cached static JSON)
- Spotify data fetching parallelized (Promise.all for independent endpoints)
- Incremental Static Regeneration for public share pages
- Full Lighthouse audit: target 90+ on Performance, Accessibility, SEO
- Database indexes on all query-path columns

#### 5. "What You're Missing" — Global Music Explorer
- No-login entry point to the macro data
- Interactive world map: genre dominance by country (using MusicBrainz + regional chart data)
- Time scrubber: drag through 1990–2024 and watch genre dominance shift
- "The global music ecosystem vs. your bubble" — shows what's thriving outside the algorithm's view
- This is the public-facing hook that draws in non-users

#### 6. Final Polish Pass
- Accessibility: ARIA labels, keyboard navigation, color contrast AA compliance
- Loading states: skeleton screens for all async components, not spinners
- Error states: graceful degradation for every failure mode (no listening history, API errors, rate limits)
- Onboarding flow: for first-time users, a 3-step intro before the dashboard loads (sets expectations, explains methodology)
- Animation refinement: all transitions 60fps, reduced-motion media query respected

### Stretch Goals (v4)
- **"Artist Algorithm Report Card" (Full)**: Claude API integration that writes a 2-paragraph critical analysis of how a specific artist has changed their sound for streaming; framed as music journalism
- **API for Developers**: public REST API for the Filter Bubble Score (rate-limited, API key required); lets other projects consume the analysis
- **Listening Receipt**: a year-in-review style printable/downloadable PDF of the user's full algorithmic profile — positioned as "the Wrapped you didn't get"
- **"Conscious Listening" Mode**: after generating Escape the Bubble recommendations, a daily digest feature that sends one new track per day for a month — outside the bubble, tracked for engagement
- **Split-test the narrative**: two versions of the narrative mode (confrontational vs. curious framing); track which drives more shares

### Success Criteria
- A stranger at the project fair understands the core thesis within 60 seconds without any explanation
- The Industry Manipulation Index produces scores that feel intuitively correct when shown to music-knowledgeable users
- The app survives 20 concurrent users at the project fair without performance degradation
- Narrative Mode works entirely on mobile (the most likely demo device)
- At least one feature genuinely surprises the user with something they didn't know about their own listening

---

## Cross-Version Technical Commitments

These apply to all versions and should never be regressed:

1. **No raw Spotify tokens in client-side code or localStorage** — httpOnly cookies only
2. **Every score includes an explanation** — no black-box numbers surfaced to users
3. **Uncertainty is explicit** — organic/algorithmic inference always labeled as estimated
4. **Macro data is cited** — every industry stat includes its source dataset
5. **The app works for edge cases**: users with no listening history, users outside the US, users with all-private playlists
6. **Progressive disclosure**: the most important insight is immediately visible; depth is available on demand but never mandatory

## Stack Additions by Version

| Feature | Added In | Dependency |
|---|---|---|
| D3.js | v1 | `d3` package |
| Recharts | v1 | `recharts` package |
| `@vercel/og` | v1 | OG image generation |
| librosa (Python) | v2 | Vercel Python Functions |
| Web Share API | v3 | Browser native |
| Intersection Observer (scroll animations) | v4 | Browser native |
| Claude API | v4 (stretch) | `@anthropic-ai/sdk` |
