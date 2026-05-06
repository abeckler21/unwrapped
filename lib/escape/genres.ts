/**
 * Curated list of genres that are:
 *  - well-represented in Spotify's artist catalog
 *  - use terms that match Spotify's genre tagging system
 *  - broad enough to be meaningful listening categories
 *
 * Gap detection: a genre is a "gap" if none of the user's
 * existing genre strings contain it as a substring.
 * e.g. user genre "jazz rap" covers "jazz"; "indie pop" covers "pop".
 */
export const GLOBAL_GENRES = [
  "jazz",
  "blues",
  "soul",
  "funk",
  "gospel",
  "reggae",
  "ska",
  "folk",
  "country",
  "bluegrass",
  "classical",
  "ambient",
  "metal",
  "punk",
  "hardcore",
  "latin",
  "bossa nova",
  "afrobeats",
  "electronic",
  "house",
  "techno",
  "drum and bass",
  "flamenco",
  "world",
  "new wave",
] as const

export type GlobalGenre = (typeof GLOBAL_GENRES)[number]

/**
 * Returns genres from GLOBAL_GENRES that are absent from the user's
 * listening profile. Capped at maxGaps to limit Spotify API calls.
 */
export function detectGapGenres(userGenres: string[], maxGaps = 5): string[] {
  const userGenreBlob = userGenres.join(" ").toLowerCase()

  const gaps: string[] = []
  for (const genre of GLOBAL_GENRES) {
    if (!userGenreBlob.includes(genre)) {
      gaps.push(genre)
      if (gaps.length >= maxGaps) break
    }
  }
  return gaps
}
