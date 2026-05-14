export type WidgetTheme = "dark" | "light"

export type ThemeColors = {
  bg: string
  cardBg: string
  border: string
  divider: string
  textStrong: string
  textSoft: string
  textMuted: string
  accent: string
  /** Always-dark background used for the radar chart area */
  chartBg: string
}

export function getThemeColors(theme: WidgetTheme): ThemeColors {
  if (theme === "light") {
    return {
      bg: "#f5f3ef",
      cardBg: "rgba(0,0,0,0.045)",
      border: "rgba(0,0,0,0.09)",
      divider: "rgba(0,0,0,0.07)",
      textStrong: "#18120a",
      textSoft: "#4b4540",
      textMuted: "#7a736c",
      accent: "#ea5f0a",
      chartBg: "#14131b",
    }
  }
  return {
    bg: "#09080e",
    cardBg: "rgba(255,255,255,0.04)",
    border: "rgba(255,255,255,0.1)",
    divider: "rgba(255,255,255,0.06)",
    textStrong: "#f8f3eb",
    textSoft: "rgba(244,241,234,0.82)",
    textMuted: "rgba(244,241,234,0.52)",
    accent: "#f97316",
    chartBg: "#09080e",
  }
}

export function parseTheme(raw: string | string[] | undefined): WidgetTheme {
  const value = Array.isArray(raw) ? raw[0] : raw
  return value === "light" ? "light" : "dark"
}
