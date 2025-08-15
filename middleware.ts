import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const SUPPORTED_LANGUAGES = ["de", "en", "fr", "es", "tr"]
const DEFAULT_LANGUAGE = "de"

function detectBrowserLanguage(acceptLanguage: string | null): string {
  if (!acceptLanguage) return DEFAULT_LANGUAGE

  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      const [code, q = "1"] = lang.trim().split(";q=")
      return {
        code: code.split("-")[0].toLowerCase(),
        quality: Number.parseFloat(q),
      }
    })
    .sort((a, b) => b.quality - a.quality)

  for (const { code } of languages) {
    if (SUPPORTED_LANGUAGES.includes(code)) {
      return code
    }
  }

  return DEFAULT_LANGUAGE
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/languages/") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon")
  ) {
    return response
  }

  // Simple language detection without server-side cookie manipulation
  const acceptLanguage = request.headers.get("accept-language")
  const detectedLanguage = detectBrowserLanguage(acceptLanguage)

  // Add language to response headers for reference
  response.headers.set("x-language", detectedLanguage)

  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|languages).*)"],
}
