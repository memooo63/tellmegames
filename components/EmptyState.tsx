"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Gamepad2, Filter, Sparkles } from "lucide-react"
import { useLanguage } from "@/hooks/useLanguage"

export function EmptyState() {
  const { t } = useLanguage()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="border-dashed border-2 backdrop-blur-sm bg-card/50">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <motion.div
            className="rounded-full bg-muted p-4 mb-4 relative"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.2,
              duration: 0.6,
              type: "spring",
              stiffness: 200,
            }}
          >
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 2,
                ease: "easeInOut",
              }}
            >
              <Gamepad2 className="h-8 w-8 text-muted-foreground" />
            </motion.div>

            <motion.div
              className="absolute -top-1 -right-1"
              animate={{
                scale: [0, 1, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 1,
                ease: "easeInOut",
              }}
            >
              <Sparkles className="h-4 w-4 text-primary" />
            </motion.div>
          </motion.div>

          <motion.h3
            className="text-lg font-semibold mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {t("empty.title")}
          </motion.h3>

          <motion.p
            className="text-muted-foreground mb-4 max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {t("empty.description")}
          </motion.p>

          <motion.div
            className="flex items-center gap-2 text-sm text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 3,
                ease: "easeInOut",
              }}
            >
              <Filter className="h-4 w-4" />
            </motion.div>
            <span>{t("filters.button.noFilters")}</span>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
