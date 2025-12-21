import { FileText, Upload } from 'lucide-react'

export function TimelineEvent({
  event,
  isExpanded,
  isHovered,
  onToggle,
  onHover
}: any) {
  const showPayload = isExpanded || isHovered

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center pt-1">
        <div className="w-2 h-2 rounded-full bg-foreground/60" />
      </div>

      <div className="flex-1">
        <div
          onClick={onToggle}
          onMouseEnter={() => onHover(event.id)}
          onMouseLeave={() => onHover(null)}
          className="flex justify-between hover:bg-muted px-2 py-1.5 rounded-sm cursor-pointer"
        >
          <div className="flex gap-2 items-center">
            <span className="text-xs text-muted-foreground">
              {new Date(event.event_time).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            <span className="font-mono text-xs bg-secondary px-2 rounded-sm">
              {event.subject_id}
            </span>
            <span className="text-sm font-medium">{event.event_type}</span>
          </div>

          {event.requires_document && (
            event.has_document ? (
              <FileText className="w-4 h-4" />
            ) : (
              <Upload className="w-4 h-4" />
            )
          )}
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
