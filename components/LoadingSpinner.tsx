"use client"

import { motion } from "framer-motion"

export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-20">
      <motion.div
        className="h-12 w-12 rounded-full border-4 border-muted border-t-primary"
        animate={{ rotate: 360 }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" }}
      />
    </div>
  )
}
