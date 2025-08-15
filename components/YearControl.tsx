"use client"

import { Slider } from "@/components/ui/slider"
import { useLanguage } from "@/hooks/useLanguage"

interface YearControlProps {
  years: [number, number]
  onChange: (years: [number, number]) => void
}

export function YearControl({ years, onChange }: YearControlProps) {
  const { t } = useLanguage()
  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-muted-foreground">{t("filters.year.label")}</label>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{years[0]}</span>
          <span>{years[1]}</span>
        </div>
        <Slider
          value={years}
          onValueChange={(value) => onChange([value[0], value[1]])}
          min={2000}
          max={2025}
          step={1}
          className="w-full"
        />
      </div>
    </div>
  )
}
