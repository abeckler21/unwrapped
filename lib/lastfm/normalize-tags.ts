const TAG_TO_GENRE: Record<string, string> = {
  pop: "pop",
  synthpop: "pop",
  dancepop: "pop",
  electropop: "pop",
  indiepop: "pop",
  rock: "rock",
  indierock: "rock",
  alternativerock: "rock",
  artrock: "rock",
  folk: "folk",
  indiefolk: "folk",
  "singer-songwriter": "folk",
  singersongwriter: "folk",
  country: "country",
  hiphop: "hip-hop",
  rap: "hip-hop",
  trap: "hip-hop",
  randb: "r&b",
  "neo-soul": "r&b",
  neosoul: "r&b",
  soul: "r&b",
  jazz: "jazz",
  bebop: "jazz",
  vocaljazz: "jazz",
  classical: "classical",
  choral: "classical",
  liturgical: "classical",
  electronic: "electronic",
  electronica: "electronic",
  house: "electronic",
  techno: "electronic",
  ambient: "electronic",
  hyperpop: "electronic",
  latin: "latin",
  reggaeton: "latin",
  bossa: "latin",
  bossanova: "latin",
};

const NOISE_TAGS = new Set([
  "seen live",
  "favorites",
  "favourite",
  "favorite",
  "love",
  "awesome",
  "british",
  "american",
  "female vocalists",
  "male vocalists",
  "under 2000 listeners",
  "under 2000 listeners on lastfm",
  "under 500 listeners",
]);

function canonicalize(tag: string) {
  return tag.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9-]/g, "");
}

export function normalizeLastFmTags(tags: string[]) {
  const normalized = new Set<string>();

  for (const tag of tags) {
    const lowered = tag.toLowerCase().trim();

    if (!lowered || NOISE_TAGS.has(lowered)) {
      continue;
    }

    const mapped = TAG_TO_GENRE[canonicalize(lowered)];

    if (mapped) {
      normalized.add(mapped);
    }
  }

  return [...normalized];
}
