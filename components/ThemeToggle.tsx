"use client"

import { useState, useEffect, useTransition } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Sun, Moon } from "lucide-react"
import { useSettings } from "@/hooks/useSettings"
import { useLanguage } from "@/hooks/useLanguage"

const themeIcons = {
  light: Sun,
  dark: Moon,
}

const themeLabels = {
  light: "settings.themes.light",
  dark: "settings.themes.dark",
}

export function ThemeToggle() {
  const { settings, setTheme, isLoading } = useSettings()
  const { t } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleThemeChange = () => {
    const nextTheme = settings.theme === "light" ? "dark" : "light"

    startTransition(async () => {
      try {
        await setTheme(nextTheme)
      } catch (error) {
        console.error("Failed to change theme:", error)
      }
    })
  }

  if (!mounted || isLoading) {
    return <div className="w-9 h-9 bg-muted animate-pulse rounded-md" />
  }

  const Icon = themeIcons[settings.theme]
  const label = t(themeLabels[settings.theme])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={handleThemeChange}
            disabled={isPending}
            className="h-9 w-9 p-0 bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80"
          >
            <motion.div
              key={settings.theme}
              initial={{ scale: 0.8, opacity: 0, rotate: -90 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <Icon className="h-4 w-4" />
            </motion.div>
            <span className="sr-only">{label}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
