import { X, User, Clock, FileText } from 'lucide-react'
import { DocumentList } from '@/components/documents/DocumentList'
import type { EventResponse } from '@/lib/types'

export interface EventDetailsModalProps {
  event: EventResponse
  onClose: () => void
}

export function EventDetailsModal({ event, onClose }: EventDetailsModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose} role="presentation">
      <div
        className="bg-background border border-blue-200 dark:border-blue-900 rounded-sm shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-blue-200 dark:border-blue-900 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20">
          <div>
            <h2 className="font-semibold text-foreground text-lg">{event.event_type}</h2>
            <p className="text-xs text-muted-foreground mt-1">Event ID: {event.id}</p>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 hover:bg-muted rounded-sm transition-colors font-medium"
            title="Close"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Event Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted/50 rounded-sm border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Subject ID</span>
              </div>
              <p className="text-sm font-mono text-foreground">{event.subject_id}</p>
            </div>

            <div className="p-3 bg-muted/50 rounded-sm border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Event Time</span>
              </div>
              <p className="text-sm text-foreground">
                {new Date(event.event_time).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Payload */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Event Data</h3>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-sm border border-slate-200 dark:border-slate-700">
              <pre className="text-xs text-foreground/90 overflow-x-auto">
                {JSON.stringify(event.payload, null, 2)}
              </pre>
            </div>
          </div>

          {/* Documents */}
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Linked Documents
            </h3>
            <DocumentList eventId={event.id} readOnly={true} />
          </div>
        </div>
      </div>
    </div>
  )
}
