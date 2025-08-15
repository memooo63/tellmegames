import { headers } from "next/headers"
import type { Language } from "@/types/language"
import { DEFAULT_LANGUAGE } from "@/lib/languages"

export async function getServerLanguageFromHeaders(): Promise<Language> {
  const headersList = await headers()
  const language = headersList.get("x-language") as Language
  return language || DEFAULT_LANGUAGE
}

export async function loadServerTranslations(language: Language, namespace = "common"): Promise<Record<string, any>> {
  try {
    // In a real application, you might want to read from the file system
    // For now, we'll return an empty object as translations are loaded client-side
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/languages/${language}/${namespace}.json`,
    )

    if (!response.ok) {
      console.warn(`Failed to load server translations for ${language}/${namespace}`)
      return {}
    }

    return await response.json()
  } catch (error) {
    console.warn(`Error loading server translations for ${language}/${namespace}:`, error)
    return {}
  }
}

export function createServerTranslator(translations: Record<string, any>) {
  return function t(key: string): string {
    const keys = key.split(".")
    let value: any = translations

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k]
      } else {
        return key // Return key if translation not found
      }
    }

    return typeof value === "string" ? value : key
  }
}
