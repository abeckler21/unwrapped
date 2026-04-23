# Project Proposal: Unwrapped

## One-Line Description
A data visualization platform that reveals how Spotify's algorithms shape your listening habits and how the music industry itself is morphing to game the system.

## The Problem
Spotify Wrapped celebrates what you listened to. But it never asks *why* you listened to it. Streaming algorithms silently shape our taste — pushing us into narrower and narrower loops of similar-sounding music while the music industry responds by engineering songs to be shorter, hookier, and more algorithmically optimized. Unwrapped is the dark side of Wrapped: a mirror that shows users how their listening is being shaped, how homogeneous their taste has become, and how the music they hear is part of a larger trend of algorithmic conformity. This matters to me because I'm a musician and music nerd who wants people to be *conscious* listeners, not passive consumers.

## Target User
Music nerds and people curious about the intersection of music and technology — the kind of person who reads articles about how streaming changed the music industry and thinks "I wonder if that's happening to me." Not the average casual listener, but someone who already cares about music and wants to understand the invisible forces shaping what they hear.

## Core Features (v1)

1. **Spotify OAuth Login** — users connect their Spotify account to pull their personal listening data (top tracks, top artists, recently played, saved songs, playlists).
2. **Algorithmic Profile Dashboard** — a personal analysis showing:
   - A "filter bubble score" measuring how narrow/homogeneous their listening is
   - Breakdown of algorithmic vs. organic listening (Discovery Weekly, autoplay, Radio vs. user-initiated plays)
   - Genre concentration and how repetitive their top tracks are relative to each other
3. **"How Music Is Changing" Visualizations** — macro-level data visualizations showing industry-wide trends: shrinking song lengths, earlier hooks, genre homogenization over time, using public datasets (Billboard charts, MusicBrainz, academic datasets).
4. **Personal vs. Macro Connection** — the bridge between the two halves: "Your average song length is 3:02. In 2005, the average hit was 4:10. Here's how the industry shifted to match listeners like you."
5. **Shareable Insights** — users can export or share key visualizations/stats (image or link), giving the project social legs.

## Tech Stack
- **Frontend:** Next.js — industry-standard React framework, great for the mix of static visualizations and dynamic user-specific pages. Recommended by the course and well-supported by Claude Code.
- **Styling:** Tailwind CSS — utility-first, fast to iterate on, pairs well with Next.js. Will supplement with custom CSS for data visualizations.
- **Database:** Supabase (PostgreSQL) — stores cached user analysis results, pre-processed macro music trend data, and user sessions. Chosen for its generous free tier, easy integration with Next.js, and built-in auth support as a fallback.
- **Auth:** Spotify OAuth (Authorization Code with PKCE flow) — the app's primary auth *is* the Spotify login since the entire experience depends on the user's Spotify data. Clerk is unnecessary here; Spotify is both the auth provider and the data source.
- **APIs:**
  - Spotify Web API — user listening data (top tracks/artists, recently played, saved tracks, playlists)
  - Public music datasets (Billboard Hot 100 historical data, MusicBrainz, Kaggle datasets on song attributes) for macro trend analysis
  - Potentially librosa (Python) for any audio feature computation needed since Spotify deprecated their audio features endpoint
- **Deployment:** Vercel — supports both the Next.js frontend and Python API routes in a single project. Simplifies the architecture significantly since both JavaScript and Python code live in one repo and deploy together.
- **MCP Servers:**
  - Supabase MCP — for database schema management and queries during development
  - Playwright MCP — for testing the Spotify OAuth flow and end-to-end user experience

## Stretch Goals
- **"Escape the Bubble" Recommendations** — using the analysis to actively recommend music *outside* the user's algorithmic comfort zone, pulling from underrepresented genres or artists with low algorithmic promotion
- **Temporal Analysis** — tracking how a user's bubble score changes over time with repeated visits (are you getting more or less algorithmically dependent?)
- **Audio Feature Computation** — since Spotify deprecated their audio features API, build a pipeline using librosa to compute tempo, energy, danceability, etc. from track previews, enabling deeper sonic analysis
- **Artist Perspective Dashboard** — flip the lens: show how an artist's music has changed over time to become more "algorithm-friendly" (shorter songs, more consistent sound)
- **Comparative Mode** — let two users compare their bubbles: how much overlap exists, who's more algorithmically captured, shared blind spots
- **Playlist Autopsy** — analyze a specific playlist and score how "algorithmically optimized" it is vs. how diverse
- **Embeddable Widgets** — let music bloggers or journalists embed specific visualizations on their own sites
- **Mobile-Optimized Experience** — ensure the visualizations are fully responsive and touch-friendly for mobile sharing from social media

## Biggest Risk
1. **Spotify API limitations** — the 25-user development mode cap is fine for a class project, but the deprecated audio features endpoint means we can't get track-level attributes (tempo, energy, danceability) directly. We'll need to either compute these ourselves, find alternative datasets, or design the analysis around what *is* available (listening patterns, genre metadata, track popularity, song duration).
2. **Defining "algorithmic" vs. "organic" listening** — Spotify's API doesn't explicitly tell you *why* a user played a track (was it autoplay? a recommendation? a manual search?). We'll need to infer this from context clues (playlist type, play patterns), which introduces imprecision. Being transparent about this with users is important.
3. **Data visualization complexity** — making the visualizations genuinely compelling and not just "charts on a page" is a design challenge as much as a technical one. The difference between an interesting project and a great one will be in the quality of the visual storytelling.

## Week 5 Goal
Demo a working application where a user can:
- Log in with Spotify and see a personalized "Algorithmic Profile" dashboard with at least three distinct metrics (filter bubble score, genre homogeneity, algorithmic vs. organic listening ratio)
- Explore interactive macro visualizations showing how popular music has changed over the streaming era
- See their personal listening connected to the macro trends ("you are here")
- Share at least one insight as an image or link

The app should feel polished enough to hand to a stranger at the project fair and have them understand and engage with it without explanation.
