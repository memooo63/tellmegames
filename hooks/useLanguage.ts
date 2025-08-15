"use client"

import { useState, useEffect, useCallback } from "react"
import type { Language, TranslationKeys } from "@/types/language"
import { DEFAULT_LANGUAGE, detectBrowserLanguage } from "@/lib/languages"
import { getCookie, setCookie } from "@/lib/cookies"

interface UseLanguageReturn {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, namespace?: string) => string
  isLoading: boolean
}

const translationCache = new Map<string, TranslationKeys>()

export function useLanguage(): UseLanguageReturn {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize language from cookie or browser
  useEffect(() => {
    const cookieLang = getCookie("lang") as Language
    const initialLang = cookieLang || detectBrowserLanguage()
    setLanguageState(initialLang)

    if (!cookieLang) {
      setCookie("lang", initialLang, { maxAge: 365 * 24 * 60 * 60 }) // 1 year
    }

    setIsLoading(false)
  }, [])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    setCookie("lang", lang, { maxAge: 365 * 24 * 60 * 60 })
    // Reload page to apply server-side language changes
    window.location.reload()
  }, [])

  const loadTranslations = useCallback(async (lang: Language, namespace = "common"): Promise<TranslationKeys> => {
    const cacheKey = `${lang}-${namespace}`

    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!
    }

    try {
      const response = await fetch(`/languages/${lang}/${namespace}.json`)
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${lang}/${namespace}`)
      }

      const translations = await response.json()
      translationCache.set(cacheKey, translations)
      return translations
    } catch (error) {
      console.warn(`Failed to load translations for ${lang}/${namespace}:`, error)

      // Fallback to default language
      if (lang !== DEFAULT_LANGUAGE) {
        return loadTranslations(DEFAULT_LANGUAGE, namespace)
      }

      return {}
    }
  }, [])

  const t = useCallback(
    (key: string, namespace = "common"): string => {
      const cacheKey = `${language}-${namespace}`
      const translations = translationCache.get(cacheKey)

      if (!translations) {
        // Load translations asynchronously if not cached
        loadTranslations(language, namespace)
        return key // Return key as fallback
      }

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
    },
    [language, loadTranslations],
  )

  return {
    language,
    setLanguage,
    t,
    isLoading,
  }
}
