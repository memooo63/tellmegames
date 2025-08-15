export const THEME_CONFIG = {
  // Available Themes
  themes: ["light", "dark"] as const,

  // Default Theme
  defaultTheme: "dark" as const,

  // Theme Cookie Settings
  cookieName: "gaming-finder-theme",

  // Color Schemes
  colors: {
    light: {
      primary: "hsl(0, 0%, 9%)",
      secondary: "hsl(0, 0%, 96.1%)",
      background: "hsl(0, 0%, 100%)",
      foreground: "hsl(0, 0%, 3.9%)",
      muted: "hsl(0, 0%, 96.1%)",
      accent: "hsl(0, 0%, 96.1%)",
      destructive: "hsl(0, 84.2%, 60.2%)",
      border: "hsl(0, 0%, 89.8%)",
    },
    dark: {
      primary: "hsl(0, 0%, 98%)",
      secondary: "hsl(0, 0%, 14.9%)",
      background: "hsl(0, 0%, 3.9%)",
      foreground: "hsl(0, 0%, 98%)",
      muted: "hsl(0, 0%, 14.9%)",
      accent: "hsl(0, 0%, 14.9%)",
      destructive: "hsl(0, 62.8%, 30.6%)",
      border: "hsl(0, 0%, 14.9%)",
    },
  },

  // Animation Settings
  animations: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    easing: {
      default: "cubic-bezier(0.4, 0, 0.2, 1)",
      bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      smooth: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    },
  },

  // Responsive Breakpoints
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
} as const

export type ThemeConfig = typeof THEME_CONFIG
export type Theme = (typeof THEME_CONFIG.themes)[number]
