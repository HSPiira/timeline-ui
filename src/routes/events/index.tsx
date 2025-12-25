import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Plus, Loader2, AlertCircle, Activity, ChevronDown, ChevronRight, Calendar } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useStore } from '@tanstack/react-store'
import { timelineApi } from '@/lib/api-client'
import { authStore } from '@/lib/auth-store'
import { EventDocumentsModal } from '@/components/documents/EventDocumentsModal'
import { EventDetailsModal } from '@/components/events/EventDetailsModal'
import { EventCard } from '@/components/events/EventCard'
import { EmptyState } from '@/components/ui/EmptyState'
import type { EventResponse } from '@/lib/types'

export const Route = createFileRoute('/events/')({
  component: EventsPage,
})

function EventsPage() {
  const navigate = useNavigate()
  const authState = useStore(authStore)
  const [events, setEvents] = useState<EventResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterEventType, setFilterEventType] = useState<string>('')
  const [eventTypes, setEventTypes] = useState<string[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [detailsEventId, setDetailsEventId] = useState<string | null>(null)
  const [documentCounts, setDocumentCounts] = useState<Record<string, number>>({})
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set())

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authState.isLoading && !authState.user) {
      navigate({ to: '/login' })
    }
  }, [authState.isLoading, authState.user, navigate])

  useEffect(() => {
    if (authState.user) {
      fetchEvents()
    }
  }, [filterEventType, authState.user])

  const fetchEvents = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = filterEventType ? { event_type: filterEventType } : undefined
      const { data, error: apiError } = await timelineApi.events.listAll(params)

      if (apiError) {
        // @ts-expect-error - openapi-fetch error handling
        const errorMessage = apiError?.message || 'Unable to connect to the server'
        setError(errorMessage)
        console.error('API error:', apiError)
      } else if (data) {
        setEvents(data)

        // Extract unique event types for filter
        const types = [...new Set(data.map((e: EventResponse) => e.event_type))]
        setEventTypes(types)

        // Load document counts for all events in parallel
        const documentPromises = data.map(async (event) => {
          try {
            const { data: docs, error } = await timelineApi.documents.listByEvent(event.id)
            if (error) {
              console.warn(`API error loading documents for event ${event.id}:`, error)
              return { eventId: event.id, count: 0 }
            }
            return { eventId: event.id, count: Array.isArray(docs) ? docs.length : 0 }
          } catch (err) {
            console.error(`Failed to load documents for event ${event.id}:`, err)
            return { eventId: event.id, count: 0 }
          }
        })

        const documentResults = await Promise.all(documentPromises)
        const counts: Record<string, number> = {}
        documentResults.forEach(({ eventId, count }) => {
          counts[eventId] = count
        })
        setDocumentCounts(counts)
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleDate = (date: string) => {
    setCollapsedDates((prev) => {
      const next = new Set(prev)
      if (next.has(date)) {
        next.delete(date)
      } else {
        next.add(date)
      }
      return next
    })
  }

  // Group events by date
  const eventsByDate = events.reduce((acc, event) => {
    const date = new Date(event.event_time).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(event)
    return acc
  }, {} as Record<string, EventResponse[]>)

  if (authState.isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Activity className="w-4 h-4 animate-pulse" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    )
  }

  if (!authState.user) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading events...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-12 h-12 rounded-xs bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-2">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">
            Unable to Load Events
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            {error}. Please check your connection and try again.
          </p>
          <button
            onClick={fetchEvents}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xs font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
          >
            <Loader2 className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-bold text-foreground mb-0.5">
              Events
            </h1>
            <p className="text-sm text-muted-foreground">
              Browse and manage all timeline events
            </p>
          </div>
          <button onClick={() => navigate({ to: '/events/create' })} className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xs font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors">
            <Plus className="w-4 h-4" />
            Log Event
          </button>
        </div>

        {/* Filters */}
        {eventTypes.length > 0 && (
          <div className="bg-card/80 backdrop-blur-sm rounded-xs p-2.5 border border-border/50 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-sm font-medium text-foreground/90">
                Filter by type:
              </label>
              <select
                value={filterEventType}
                onChange={(e) => setFilterEventType(e.target.value)}
                className="px-2.5 py-1 bg-background border border-input rounded-xs text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All Event Types</option>
                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {filterEventType && (
                <button
                  onClick={() => setFilterEventType('')}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>
        )}

        {/* Empty State or Events Timeline */}
        {events.length === 0 ? (
          <div className="bg-card/80 backdrop-blur-sm rounded-xs border border-border/50">
            <EmptyState
              icon={Calendar}
              title="No events yet"
              description="Events are recorded actions or state changes tracked in chronological order. Log your first event to build a timeline history."
              action={{
                label: 'Log Your First Event',
                onClick: () => navigate({ to: '/events/create' }),
              }}
            />
          </div>
        ) : (
          <div className="bg-card/80 backdrop-blur-sm rounded-xs p-4 border border-border/50">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Event Timeline
            </h2>
            <div className="space-y-6">
              {Object.entries(eventsByDate).map(([date, dateEvents]) => {
                const isDateCollapsed = collapsedDates.has(date)

                return (
                  <div key={date}>
                    {/* Date Header */}
                    <button
                      onClick={() => toggleDate(date)}
                      className="flex items-center gap-2 mb-4"
                    >
                      {isDateCollapsed ? <ChevronRight /> : <ChevronDown />}
                      <span className="font-semibold">{date}</span>
                      <span className="text-xs text-muted-foreground">
                        ({dateEvents.length})
                      </span>
                    </button>

                    {/* Events for this date */}
                    {!isDateCollapsed && (
                      <div className="ml-6 space-y-2">
                        {dateEvents.map((event) => {
                          const docCount = documentCounts[event.id] || 0
                          return (
                            <EventCard
                              key={event.id}
                              event={event}
                              documentCount={docCount}
                              onViewDetails={() => setDetailsEventId(event.id)}
                              onViewDocuments={() => setSelectedEventId(event.id)}
                            />
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Documents Modal */}
        {selectedEventId && events.length > 0 && (() => {
          const event = events.find(e => e.id === selectedEventId)
          return event ? (
            <EventDocumentsModal
              eventId={event.id}
              subjectId={event.subject_id}
              eventType={event.event_type}
              onClose={() => setSelectedEventId(null)}
              onDocumentsUpdated={() => {
                // Refresh documents
                setSelectedEventId(null)
                fetchEvents()
              }}
            />
          ) : null
        })()}

        {/* Details Modal */}
        {detailsEventId && events.length > 0 && (() => {
          const event = events.find(e => e.id === detailsEventId)
          return event ? (
            <EventDetailsModal
              event={event}
              onClose={() => setDetailsEventId(null)}
            />
          ) : null
        })()}

    </>
  )
}
