/**
 * Loads Inter font data for use in next/og ImageResponse (Satori).
 * Fetches from Google Fonts CDN. Called once per OG image request (Edge/Node).
 */
export async function loadInterFonts(): Promise<
  { name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" }[]
> {
  async function fetchWeight(weight: 400 | 700) {
    // Ask Google Fonts for the CSS — User-Agent controls which format we get (woff2)
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&display=swap`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        },
      },
    ).then((r) => r.text())

    const match = css.match(/src: url\(([^)]+)\) format/)
    if (!match?.[1]) throw new Error(`Inter ${weight}: no URL in CSS`)
    return fetch(match[1]).then((r) => r.arrayBuffer())
  }

  const [regular, bold] = await Promise.all([fetchWeight(400), fetchWeight(700)])
  return [
    { name: "Inter", data: regular, weight: 400, style: "normal" },
    { name: "Inter", data: bold, weight: 700, style: "normal" },
  ]
}
