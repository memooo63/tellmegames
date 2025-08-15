"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Cookie } from "lucide-react"
import { hasConsentCookie, setConsentCookie } from "@/lib/cookies"
import { useLanguage } from "@/hooks/useLanguage"

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)
  const { t, isLoading } = useLanguage()

  useEffect(() => {
    // Show consent banner if not already accepted
    const hasConsent = hasConsentCookie()
    setShowConsent(!hasConsent)
  }, [])

  if (isLoading) {
    return null
  }

  const handleAccept = () => {
    setConsentCookie()
    setShowConsent(false)
  }

  const handleDecline = () => {
    setShowConsent(false)
    // Note: We still need some cookies for basic functionality
    console.info("Cookies declined - some functionality may be limited")
  }

  return (
    <AnimatePresence>
      {showConsent && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md"
        >
          <Card className="p-4 backdrop-blur-sm bg-card/95 border-border/50 shadow-lg">
            <div className="flex items-start gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
              >
                <Cookie className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              </motion.div>

              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-medium text-sm mb-1">{t("cookies.title", "Cookie-Einstellungen")}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t("footer.disclaimer")}</p>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAccept} className="text-xs h-8">
                    {t("cookies.accept", "Akzeptieren")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDecline} className="text-xs h-8 bg-transparent">
                    {t("cookies.decline", "Ablehnen")}
                  </Button>
                </div>
              </div>

              <Button variant="ghost" size="sm" onClick={handleDecline} className="h-8 w-8 p-0 flex-shrink-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
