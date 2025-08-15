"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { useLanguage } from "@/hooks/useLanguage"

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { t } = useLanguage()

  return (
    <Card className="border-destructive/50">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-destructive/10 p-4 mb-4">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{t("errors.generic")}</h3>
        <p className="text-muted-foreground mb-4 max-w-md">{message || t("errors.apiError")}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("errors.retry")}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
