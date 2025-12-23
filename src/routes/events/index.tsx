import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Plus, Calendar, User, Clock, Loader2, AlertCircle, Activity } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useStore } from '@tanstack/react-store'
import { timelineApi } from '@/lib/api-client'
import { authStore } from '@/lib/auth-store'
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
        // @ts-ignore - openapi-fetch error handling
        const errorMessage = apiError?.message || 'Unable to connect to the server'
        setError(errorMessage)
        console.error('API error:', apiError)
      } else if (data) {
        setEvents(data)

        // Extract unique event types for filter
        const types = [...new Set(data.map((e: EventResponse) => e.event_type))]
        setEventTypes(types)
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (authState.isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Activity className="w-5 h-5 animate-pulse" />
          <span>Loading...</span>
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
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading events...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 rounded-sm bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Unable to Load Events
          </h3>
          <p className="text-muted-foreground mb-6">
            {error}. Please check your connection and try again.
          </p>
          <button
            onClick={fetchEvents}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent mb-2">
              Events
            </h1>
            <p className="text-muted-foreground">
              Browse and manage all timeline events
            </p>
          </div>
          <button onClick={() => navigate({ to: '/events/create' })} className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors">
            <Plus className="w-4 h-4" />
            Log Event
          </button>
        </div>

        {/* Filters */}
        {eventTypes.length > 0 && (
          <div className="bg-card/80 backdrop-blur-sm rounded-sm p-4 border border-border/50 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm font-medium text-foreground/90">
                Filter by type:
              </label>
              <select
                value={filterEventType}
                onChange={(e) => setFilterEventType(e.target.value)}
                className="px-3 py-2 bg-background border border-input rounded-sm text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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

        {/* Empty State or Events List */}
        {events.length === 0 ? (
          <div className="bg-card/80 backdrop-blur-sm rounded-sm p-12 border border-border/50 text-center">
            <div className="w-16 h-16 rounded-sm bg-secondary flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground/70" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No events yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Events are recorded actions or state changes. Start logging events to build your timeline history.
            </p>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors">
              <Plus className="w-4 h-4" />
              Log Your First Event
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event: EventResponse) => (
              <div
                key={event.id}
                className="bg-card/80 backdrop-blur-sm rounded-sm p-5 border border-border/50 hover:border-border transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Event Icon */}
                    <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-foreground/75 to-foreground/55 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-background" />
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">
                          {event.event_type}
                        </h3>
                        <span className="px-2 py-0.5 text-xs font-medium bg-secondary text-foreground/90 rounded-sm">
                          {event.id.slice(0, 8)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1.5">
                          <User className="w-4 h-4" />
                          <span>Subject: {event.subject_id.slice(0, 8)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(event.event_time).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Payload Preview */}
                      {event.payload && (
                        <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-sm border border-slate-200 dark:border-slate-700">
                          <pre className="text-xs text-foreground/90 overflow-x-auto">
                            {JSON.stringify(event.payload, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <button className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-700 rounded-sm transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
    </>
  )
}
