import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Calendar, Tag, Loader2, AlertCircle, ChevronDown, ChevronRight, Activity } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useStore } from '@tanstack/react-store'
import { timelineApi } from '@/lib/api-client'
import { authStore } from '@/lib/auth-store'
import type { SubjectResponse, EventResponse } from '@/lib/types'

export const Route = createFileRoute('/events/subject/$subjectId')({
  component: SubjectEventsPage,
})

function SubjectEventsPage() {
  const { subjectId } = Route.useParams()
  const navigate = useNavigate()
  const authState = useStore(authStore)
  const [subject, setSubject] = useState<SubjectResponse | null>(null)
  const [events, setEvents] = useState<EventResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set())
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authState.isLoading && !authState.user) {
      navigate({ to: '/login' })
    }
  }, [authState.isLoading, authState.user, navigate])

  useEffect(() => {
    if (authState.user) {
      fetchData()
    }
  }, [subjectId, authState.user])

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch subject details
      const { data: subjectData, error: subjectError } = await timelineApi.subjects.get(
        subjectId
      )

      if (subjectError) {
        // @ts-ignore - openapi-fetch error handling
        const errorMessage = subjectError?.message || 'Unable to load subject'
        setError(errorMessage)
        setLoading(false)
        return
      }

      if (subjectData) {
        setSubject(subjectData)
      }

      // Fetch events for subject
      const { data: eventsData, error: eventsError } = await timelineApi.events.list(
        subjectId
      )

      if (eventsError) {
        // @ts-ignore - openapi-fetch error handling
        const errorMessage = eventsError?.message || 'Unable to load events'
        setError(errorMessage)
      } else if (eventsData) {
        setEvents(eventsData)
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

  const toggleEvent = (eventId: string) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev)
      if (next.has(eventId)) {
        next.delete(eventId)
      } else {
        next.add(eventId)
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
          <span>Loading timeline...</span>
        </div>
      </div>
    )
  }

  if (error || !subject) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 rounded-sm bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Unable to Load Subject
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {error || 'Subject not found'}. Please check your connection and try again.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
            >
              <Loader2 className="w-4 h-4" />
              Retry
            </button>
            <button
              onClick={() => navigate({ to: '/subjects' })}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              Back to Subjects
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate({ to: '/subjects' })}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Subjects</span>
        </button>

        {/* Subject Header */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-sm p-6 border border-slate-200/50 dark:border-slate-700/50 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {subject.id}
              </h1>
              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span className="font-medium">{subject.subject_type}</span>
                </div>
                {subject.external_ref && (
                  <div className="flex items-center gap-2">
                    <span>Ref:</span>
                    <span className="font-mono">{subject.external_ref}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Created {new Date(subject.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Events</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {events.length}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-sm p-6 border border-slate-200/50 dark:border-slate-700/50">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">
            Event Timeline
          </h2>

          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No events recorded for this subject yet
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(eventsByDate).map(([date, dateEvents]) => {
                const isDateCollapsed = collapsedDates.has(date)

                return (
                  <div key={date}>
                    {/* Date Header */}
                    <button
                      onClick={() => toggleDate(date)}
                      className="flex items-center gap-2 w-full text-left mb-4 group"
                    >
                      {isDateCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                      )}
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {date}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        ({dateEvents.length} {dateEvents.length === 1 ? 'event' : 'events'})
                      </span>
                    </button>

                    {/* Events for this date */}
                    {!isDateCollapsed && (
                      <div className="ml-6 space-y-4">
                        {dateEvents.map((event, index) => {
                          const isExpanded = expandedEvents.has(event.id)

                          return (
                            <div key={event.id} className="flex gap-4">
                              {/* Timeline dot and line */}
                              <div className="flex flex-col items-center pt-1">
                                <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400" />
                                {index < dateEvents.length - 1 && (
                                  <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700 mt-2 min-h-[60px]" />
                                )}
                              </div>

                              {/* Event content */}
                              <div className="flex-1 pb-4">
                                <div
                                  onClick={() => toggleEvent(event.id)}
                                  className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-sm border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                        {new Date(event.event_time).toLocaleTimeString('en-US', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          second: '2-digit',
                                        })}
                                      </span>
                                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        {event.event_type}
                                      </span>
                                    </div>
                                    <span className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-sm font-mono">
                                      {event.id.slice(0, 8)}
                                    </span>
                                  </div>

                                  {/* Payload - shown when expanded */}
                                  {isExpanded && event.payload && (
                                    <div className="mt-3 p-3 bg-white dark:bg-slate-800 rounded-sm border border-slate-200 dark:border-slate-700">
                                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                                        Event Data
                                      </p>
                                      <pre className="text-xs text-slate-700 dark:text-slate-300 overflow-x-auto">
                                        {JSON.stringify(event.payload, null, 2)}
                                      </pre>
                                    </div>
                                  )}

                                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                                    Click to {isExpanded ? 'collapse' : 'expand'} details
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
