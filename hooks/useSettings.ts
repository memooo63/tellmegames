"use client"

import { useState, useEffect, useCallback } from "react"
import type { Settings, Language } from "@/types/language"
import { getCookie, setCookie, isCookieSupported } from "@/lib/cookies"
import { DEFAULT_LANGUAGE } from "@/lib/languages"
import { changeThemeAction, saveFiltersAction } from "@/lib/actions/settings"

const DEFAULT_SETTINGS: Settings = {
  language: DEFAULT_LANGUAGE,
  theme: "dark",
  filters: {},
}

interface UseSettingsReturn {
  settings: Settings
  setSettings: (updater: Partial<Settings> | ((prev: Settings) => Settings)) => void
  setTheme: (theme: Settings["theme"]) => Promise<void>
  saveFilters: (filters: Settings["filters"]) => Promise<void>
  isLoading: boolean
  cookieSupported: boolean
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)
  const [cookieSupported, setCookieSupported] = useState(true)

  // Load settings from cookies on mount
  useEffect(() => {
    const loadSettings = () => {
      // Check cookie support
      const supported = isCookieSupported()
      setCookieSupported(supported)

      if (!supported) {
        console.warn("Cookies are not supported or disabled")
        setIsLoading(false)
        return
      }

      const lang = (getCookie("lang") as Language) || DEFAULT_LANGUAGE
      const theme = (getCookie("theme") as Settings["theme"]) || "dark"
      const filtersJson = getCookie("filters")

      let filters = {}
      if (filtersJson) {
        try {
          filters = JSON.parse(filtersJson)
        } catch (error) {
          console.warn("Failed to parse filters from cookie:", error)
        }
      }

      setSettingsState({
        language: lang,
        theme,
        filters,
      })

      setIsLoading(false)
    }

    loadSettings()
  }, [])

  const setSettings = useCallback(
    (updater: Partial<Settings> | ((prev: Settings) => Settings)) => {
      if (!cookieSupported) {
        console.warn("Cannot save settings: cookies not supported")
        return
      }

      setSettingsState((prev) => {
        const newSettings = typeof updater === "function" ? updater(prev) : { ...prev, ...updater }

        // Save to cookies with error handling
        try {
          setCookie("lang", newSettings.language, { maxAge: 365 * 24 * 60 * 60 })
          setCookie("theme", newSettings.theme, { maxAge: 365 * 24 * 60 * 60 })
          setCookie("filters", JSON.stringify(newSettings.filters), { maxAge: 365 * 24 * 60 * 60 })
        } catch (error) {
          console.error("Failed to save settings to cookies:", error)
        }

        return newSettings
      })
    },
    [cookieSupported],
  )

  const setTheme = useCallback(
    async (theme: Settings["theme"]) => {
      try {
        await changeThemeAction(theme)
        setSettingsState((prev) => ({ ...prev, theme }))
      } catch (error) {
        console.error("Failed to change theme:", error)
        // Fallback to client-side update
        setSettings({ theme })
      }
    },
    [setSettings],
  )

  const saveFilters = useCallback(
    async (filters: Settings["filters"]) => {
      try {
        await saveFiltersAction(filters)
        setSettingsState((prev) => ({ ...prev, filters }))
      } catch (error) {
        console.error("Failed to save filters:", error)
        // Fallback to client-side update
        setSettings({ filters })
      }
    },
    [setSettings],
  )

  return {
    settings,
    setSettings,
    setTheme,
    saveFilters,
    isLoading,
    cookieSupported,
  }
}
