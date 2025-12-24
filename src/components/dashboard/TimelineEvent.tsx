import { useEffect, useState } from 'react'
import { FileText, AlertCircle } from 'lucide-react'
import { timelineApi } from '@/lib/api-client'
import type { EventResponse } from '@/lib/types'

interface TimelineEventProps {
  event: EventResponse
  isExpanded: boolean
  isHovered: boolean
  onToggle: () => void
  onHover: (eventId: string | null) => void
  onViewDocuments?: (eventId: string) => void
}

export function TimelineEvent({
  event,
  isExpanded,
  isHovered,
  onToggle,
  onHover,
  onViewDocuments
}: TimelineEventProps) {
  const [documentCount, setDocumentCount] = useState<number | null>(null)
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const showPayload = isExpanded || isHovered

  // Load document count when event is visible
  useEffect(() => {
    if (isExpanded || isHovered) {
      checkDocuments()
    }
  }, [isExpanded, isHovered])

  const checkDocuments = async () => {
    setLoadingDocuments(true)
    try {
      const { data, error } = await timelineApi.documents.listByEvent(event.id)
      if (!error && data && Array.isArray(data)) {
        setDocumentCount(data.length)
      }
    } catch (err) {
      console.error('Failed to load document count:', err)
    } finally {
      setLoadingDocuments(false)
    }
  }

  const hasDocuments = documentCount !== null && documentCount > 0

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center pt-1">
        <div className="w-2 h-2 rounded-full bg-foreground/60" />
      </div>

      <div className="flex-1">
        <div
          onClick={onToggle}
          onMouseEnter={() => {
            onHover(event.id)
            checkDocuments()
          }}
          onMouseLeave={() => onHover(null)}
          className="flex justify-between hover:bg-blue-50 dark:hover:bg-blue-950/30 px-2 py-1.5 rounded-sm cursor-pointer transition-colors"
        >
          <div className="flex gap-2 items-center">
            <span className="text-xs text-muted-foreground font-mono">
              {new Date(event.event_time).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            <span className="font-mono text-xs bg-gradient-to-r from-slate-600 to-slate-700 dark:from-slate-700 dark:to-slate-800 text-slate-100 px-2 py-0.5 rounded-sm">
              {event.subject_id.slice(0, 8)}
            </span>
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">{event.event_type}</span>

            {/* Document Indicator */}
            {loadingDocuments && (
              <div className="text-xs text-muted-foreground">
                <AlertCircle className="w-3 h-3 inline animate-pulse" />
              </div>
            )}
            {hasDocuments && !loadingDocuments && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onViewDocuments?.(event.id)
                }}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 rounded-sm hover:bg-amber-200 dark:hover:bg-amber-900/40 transition-colors border border-amber-300 dark:border-amber-700"
                title={`${documentCount} document${documentCount !== 1 ? 's' : ''}`}
              >
                <FileText className="w-3 h-3" />
                <span className="text-xs font-medium">{documentCount}</span>
              </button>
            )}
          </div>
        </div>

        {showPayload && event.payload && (
          <div className="ml-2 mt-1 text-xs text-muted-foreground">
            {Object.entries(event.payload).map(([k, v]) => (
              <div key={k}>
                <strong>{k}:</strong> {String(v)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
