"use client"

import { createContext, useContext, useState } from "react"
import { useSearchParams } from "next/navigation"

export interface DebugInfo {
  filters?: any
  requestUrl?: string
  traceId?: string
  resultCount?: number
  fallback?: boolean
  cacheHit?: string | null
  error?: string | null
}

interface DebugContextType {
  info: DebugInfo
  setInfo: (d: Partial<DebugInfo>) => void
  visible: boolean
  setVisible: (v: boolean) => void
}

const DebugContext = createContext<DebugContextType | null>(null)

export function DebugProvider({ children }: { children: React.ReactNode }) {
  const [info, setInfoState] = useState<DebugInfo>({})
  const [visible, setVisible] = useState(false)
  const setInfo = (d: Partial<DebugInfo>) =>
    setInfoState((prev) => ({ ...prev, ...d }))
  return (
    <DebugContext.Provider value={{ info, setInfo, visible, setVisible }}>
      {children}
    </DebugContext.Provider>
  )
}

export function useDebug() {
  const ctx = useContext(DebugContext)
  if (!ctx) throw new Error("useDebug must be used within DebugProvider")
  return ctx
}

export function DebugPanel() {
  const { info, visible, setVisible } = useDebug()
  const search = useSearchParams()
  const show =
    visible && (process.env.NODE_ENV !== "production" || search.get("debug") === "1")
  if (!show) return null
  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 text-xs max-w-sm rounded z-50 space-y-2">
      <button
        className="absolute top-1 right-1 text-white"
        onClick={() => setVisible(false)}
      >
        ×
      </button>
      <div>
        <strong>Filters:</strong>
        <pre className="whitespace-pre-wrap">{JSON.stringify(info.filters, null, 2)}</pre>
      </div>
      <div>
        <strong>Request:</strong> {info.requestUrl}
      </div>
      <div>
        <strong>x-trace-id:</strong> {info.traceId}
      </div>
      <div>
        <strong>Result count:</strong> {info.resultCount}
      </div>
      <div>
        <strong>Fallback:</strong> {String(info.fallback)}
      </div>
      <div>
        <strong>Cache:</strong> {info.cacheHit ?? ""}
      </div>
      {info.error && (
        <div>
          <strong>Error:</strong> {info.error}
        </div>
      )}
    </div>
  )
}
