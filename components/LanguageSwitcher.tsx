"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronDown, Globe } from "lucide-react"
import { useLanguage } from "@/hooks/useLanguage"
import { SUPPORTED_LANGUAGES, getLanguageConfig } from "@/lib/languages"
import { changeLanguageAction } from "@/lib/actions/settings"
import type { Language } from "@/types/language"

export function LanguageSwitcher() {
  const { language, t, isLoading } = useLanguage()
  const [open, setOpen] = useState(false)
  const [isChanging, setIsChanging] = useState(false)

  const currentLanguage = getLanguageConfig(language)

  const handleLanguageChange = async (newLanguage: Language) => {
    if (newLanguage === language) {
      setOpen(false)
      return
    }

    setIsChanging(true)
    try {
      await changeLanguageAction(newLanguage)
    } catch (error) {
      console.error("Failed to change language:", error)
      // Fallback to client-side reload
      window.location.reload()
    } finally {
      setIsChanging(false)
      setOpen(false)
    }
  }

  if (isLoading) {
    return <div className="w-[140px] h-9 bg-muted animate-pulse rounded-md" />
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 gap-2 min-w-[140px] justify-between bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80"
          disabled={isChanging}
        >
          <div className="flex items-center gap-2">
            <motion.span
              className="text-base leading-none"
              animate={isChanging ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {isChanging ? <Globe className="h-4 w-4" /> : currentLanguage.flag}
            </motion.span>
            <span className="text-sm font-medium">{currentLanguage.nativeName}</span>
          </div>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[200px] p-1" align="end">
        <div className="space-y-1">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <motion.button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isChanging}
            >
              <span className="text-base">{lang.flag}</span>
              <span className="flex-1 text-left">{lang.nativeName}</span>
              <AnimatePresence>
                {language === lang.code && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <Check className="h-4 w-4 text-primary" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>

        <div className="border-t mt-2 pt-2 px-3 py-2">
          <p className="text-xs text-muted-foreground">{t("settings.language")}</p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
