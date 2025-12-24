import { Calendar, User, Clock, FileText, Eye } from 'lucide-react'
import type { EventResponse } from '@/lib/types'

export interface EventCardProps {
  event: EventResponse
  documentCount?: number
  onViewDetails?: () => void
  onViewDocuments?: () => void
}

export function EventCard({
  event,
  documentCount = 0,
  onViewDetails,
  onViewDocuments,
}: EventCardProps) {
  const hasDocuments = documentCount > 0

  return (
    <div className="bg-gradient-to-r from-card to-card/50 backdrop-blur-sm rounded-sm p-4 border border-transparent hover:border-blue-200/60 dark:hover:border-blue-800/40 transition-colors shadow-sm hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2.5 flex-1">
          {/* Event Icon */}
          <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-white" />
          </div>

          {/* Event Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <h3 className="font-semibold text-foreground text-sm">
                {event.event_type}
              </h3>
              <span className="px-2 py-0.5 text-xs font-mono bg-slate-700 dark:bg-slate-600 text-slate-100 dark:text-slate-200 rounded-sm">
                {event.id.slice(0, 8)}
              </span>
              {hasDocuments && (
                <button
                  onClick={onViewDocuments}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 rounded-sm hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                  title={`${documentCount} document${documentCount !== 1 ? 's' : ''}`}
                >
                  <FileText className="w-3 h-3" />
                  <span className="text-xs font-medium">{documentCount}</span>
                </button>
              )}
              {onViewDetails && (
                <button
                  onClick={onViewDetails}
                  className="px-2 py-0.5 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-950/30 rounded-sm transition-colors ml-auto"
                  title="View details"
                >
                  <Eye className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>Subject: {event.subject_id.slice(0, 8)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{new Date(event.event_time).toLocaleString()}</span>
              </div>
            </div>

            {/* Payload Preview */}
            {event.payload && (
              <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-sm border border-slate-200 dark:border-slate-700">
                <pre className="text-xs text-foreground/90 overflow-x-auto">
                  {JSON.stringify(event.payload, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
