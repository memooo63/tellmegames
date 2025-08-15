// This file is now a placeholder - all cookie functionality moved to client-side lib/cookies.ts

export function getServerLanguage() {
  console.warn("Server-side cookie access disabled in preview environment")
  return "de"
}

export function getServerTheme() {
  console.warn("Server-side cookie access disabled in preview environment")
  return "system"
}

export function getServerSettings() {
  console.warn("Server-side cookie access disabled in preview environment")
  return {
    language: "de" as const,
    theme: "system" as const,
    filters: {},
  }
}

// Client-side alternatives should be used instead
export function setServerLanguage() {
  console.warn("Use client-side setCookie from lib/cookies.ts instead")
}

export function setServerTheme() {
  console.warn("Use client-side setCookie from lib/cookies.ts instead")
}

export function setServerFilters() {
  console.warn("Use client-side setCookie from lib/cookies.ts instead")
}

export function clearAllCookies() {
  console.warn("Use client-side deleteCookie from lib/cookies.ts instead")
}

export function getCookieConsent() {
  console.warn("Use client-side hasConsentCookie from lib/cookies.ts instead")
  return false
}
