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
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
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
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading events...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 rounded-sm bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Unable to Load Events
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
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
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent mb-2">
              Events
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Browse and manage all timeline events
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors">
            <Plus className="w-4 h-4" />
            Log Event
          </button>
        </div>

        {/* Filters */}
        {eventTypes.length > 0 && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-sm p-4 border border-slate-200/50 dark:border-slate-700/50 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Filter by type:
              </label>
              <select
                value={filterEventType}
                onChange={(e) => setFilterEventType(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-sm text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>
        )}

        {/* Empty State or Events List */}
        {events.length === 0 ? (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-sm p-12 border border-slate-200/50 dark:border-slate-700/50 text-center">
            <div className="w-16 h-16 rounded-sm bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No events yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
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
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-sm p-5 border border-slate-200/50 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Event Icon */}
                    <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                          {event.event_type}
                        </h3>
                        <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-sm">
                          {event.id.slice(0, 8)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-2">
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
                          <pre className="text-xs text-slate-700 dark:text-slate-300 overflow-x-auto">
                            {JSON.stringify(event.payload, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <button className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-sm transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
