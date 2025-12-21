import { ChevronDown, ChevronRight } from 'lucide-react'
import { TimelineEvent } from './TimelineEvent'

export function RecentActivity({
  eventsByDate,
  timeline
}: any) {
  return (
    <div className="space-y-6">
      {Object.entries(eventsByDate).map(([date, events]: any) => {
        const collapsed = timeline.collapsedDates.has(date)

        return (
          <div key={date}>
            <button
              onClick={() => timeline.toggleDate(date)}
              className="flex items-center gap-2 mb-4"
            >
              {collapsed ? <ChevronRight /> : <ChevronDown />}
              <span className="font-semibold">{date}</span>
              <span className="text-xs text-muted-foreground">
                ({events.length})
              </span>
            </button>

            {!collapsed && (
              <div className="ml-6 space-y-3 max-h-96 overflow-y-auto">
                {events.map((event: any) => (
                  <TimelineEvent
                    key={event.id}
                    event={event}
                    isExpanded={timeline.expandedEvents.has(event.id)}
                    isHovered={timeline.hoveredEvent === event.id}
                    onToggle={() => timeline.toggleEvent(event.id)}
                    onHover={timeline.setHoveredEvent}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
