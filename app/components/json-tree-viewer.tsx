"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "../lib/utils"

interface JsonTreeViewerProps {
  data: unknown
  depth?: number
}

const getValueColor = (value: unknown): string => {
  if (value === null) return "text-muted-foreground italic"
  if (typeof value === "string") return "text-emerald-600 dark:text-emerald-400"
  if (typeof value === "number") return "text-blue-600 dark:text-blue-400"
  if (typeof value === "boolean") return "text-amber-600 dark:text-amber-400"
  return "text-foreground"
}

const JsonValue = ({ value }: { value: unknown }) => {
  if (value === null) return <span className={getValueColor(value)}>null</span>
  if (typeof value === "string") return <span className={getValueColor(value)}>&quot;{value}&quot;</span>
  if (typeof value === "boolean") return <span className={getValueColor(value)}>{value.toString()}</span>
  if (typeof value === "number") return <span className={getValueColor(value)}>{value}</span>
  return null
}

export function JsonTreeViewer({ data, depth = 0 }: JsonTreeViewerProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    // Expand first level by default
    if (depth === 0 && data !== null && typeof data === "object") {
      const isArray = Array.isArray(data)
      const entries = isArray ? (data as unknown[]).map((_, i) => String(i)) : Object.keys(data as Record<string, unknown>)
      return entries.reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<string, boolean>)
    }
    return {}
  })

  const toggleExpand = (key: string) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  if (data === null || typeof data !== "object") {
    return <JsonValue value={data} />
  }

  const isArray = Array.isArray(data)
  const entries = isArray ? (data as unknown[]).map((v, i) => [String(i), v]) : Object.entries(data as Record<string, unknown>)
  const bracket = isArray ? ["[", "]"] : ["{", "}"]

  if (entries.length === 0) {
    return <span className="text-muted-foreground">{bracket[0]}{bracket[1]}</span>
  }

  return (
    <div className="inline-block">
      <span className="text-muted-foreground font-bold">{bracket[0]}</span>
      <div className="ml-4">
        {entries.map(([key, value], index) => {
          const keyStr = String(key)
          const isExpandable = value !== null && typeof value === "object"
          const isExpanded = expanded[keyStr] !== false

          return (
            <div key={keyStr} className="leading-relaxed">
              <span className="inline-flex items-center">
                {isExpandable && (
                  <button
                    type="button"
                    onClick={() => toggleExpand(keyStr)}
                    className="mr-1 p-0.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
                {!isExpandable && <span className="w-5 inline-block" />}
                {!isArray && (
                  <>
                    <span className="text-purple-600 dark:text-purple-400 font-medium">{keyStr}</span>
                    <span className="text-muted-foreground mx-1.5">:</span>
                  </>
                )}
                {!isExpandable ? (
                  <JsonValue value={value} />
                ) : isExpanded ? (
                  <JsonTreeViewer data={value} depth={depth + 1} />
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleExpand(keyStr)}
                    className="text-muted-foreground hover:text-foreground italic text-xs px-1 py-0.5 rounded bg-muted/50 hover:bg-muted transition-colors"
                  >
                    {Array.isArray(value) ? `${(value as unknown[]).length} items` : `${Object.keys(value as Record<string, unknown>).length} keys`}
                  </button>
                )}
                {index < entries.length - 1 && (
                  <span className="text-muted-foreground">,</span>
                )}
              </span>
            </div>
          )
        })}
      </div>
      <span className="text-muted-foreground font-bold">{bracket[1]}</span>
    </div>
  )
}
