"use client"

interface CookieOptions {
  maxAge?: number
  expires?: Date
  path?: string
  domain?: string
  secure?: boolean
  sameSite?: "strict" | "lax" | "none"
}

export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  if (typeof document === "undefined") return

  const {
    maxAge,
    expires,
    path = "/",
    domain,
    secure = process.env.NODE_ENV === "production",
    sameSite = "lax",
  } = options

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`

  if (maxAge !== undefined) {
    cookieString += `; Max-Age=${maxAge}`
  }

  if (expires) {
    cookieString += `; Expires=${expires.toUTCString()}`
  }

  cookieString += `; Path=${path}`

  if (domain) {
    cookieString += `; Domain=${domain}`
  }

  if (secure) {
    cookieString += "; Secure"
  }

  cookieString += `; SameSite=${sameSite}`

  document.cookie = cookieString
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null

  const nameEQ = encodeURIComponent(name) + "="
  const cookies = document.cookie.split(";")

  for (let cookie of cookies) {
    cookie = cookie.trim()
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length))
    }
  }

  return null
}

export function deleteCookie(name: string, path = "/"): void {
  setCookie(name, "", { maxAge: -1, path })
}

export function getAllCookies(): Record<string, string> {
  if (typeof document === "undefined") return {}

  const cookies: Record<string, string> = {}

  document.cookie.split(";").forEach((cookie) => {
    const [name, ...rest] = cookie.trim().split("=")
    if (name && rest.length > 0) {
      try {
        cookies[decodeURIComponent(name)] = decodeURIComponent(rest.join("="))
      } catch (error) {
        console.warn(`Failed to decode cookie: ${name}`, error)
      }
    }
  })

  return cookies
}

export function isCookieSupported(): boolean {
  if (typeof document === "undefined") return false

  try {
    const testKey = "__cookie_test__"
    setCookie(testKey, "test", { maxAge: 1 })
    const supported = getCookie(testKey) === "test"
    deleteCookie(testKey)
    return supported
  } catch {
    return false
  }
}

export function hasConsentCookie(): boolean {
  return getCookie("cookie_consent") === "accepted"
}

export function setConsentCookie(): void {
  setCookie("cookie_consent", "accepted", { maxAge: 365 * 24 * 60 * 60 })
}

export function getCookieSize(): number {
  if (typeof document === "undefined") return 0
  return document.cookie.length
}

export function isCookieLimitReached(): boolean {
  // Most browsers limit cookies to ~4KB per domain
  return getCookieSize() > 3800
}

export function getLanguageCookie(): string {
  return getCookie("lang") || "de"
}

export function setLanguageCookie(language: string): void {
  setCookie("lang", language, { maxAge: 365 * 24 * 60 * 60 })
}

export function getThemeCookie(): string {
  return getCookie("theme") || "dark"
}

export function setThemeCookie(theme: string): void {
  setCookie("theme", theme, { maxAge: 365 * 24 * 60 * 60 })
}

export function getFiltersCookie(): Record<string, any> {
  const filtersJson = getCookie("filters")
  if (!filtersJson) return {}

  try {
    return JSON.parse(filtersJson)
  } catch (error) {
    console.warn("Failed to parse filters cookie:", error)
    return {}
  }
}

export function setFiltersCookie(filters: Record<string, any>): void {
  setCookie("filters", JSON.stringify(filters), { maxAge: 365 * 24 * 60 * 60 })
}
