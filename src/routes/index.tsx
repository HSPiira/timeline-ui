import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { useEffect, useState } from 'react'
import { authStore } from '../lib/auth-store'
import { Users, Calendar, Workflow, Plus, FileText, TrendingUp, Activity, ChevronDown, ChevronRight, Upload } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const navigate = useNavigate()
  const authState = useStore(authStore)
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set())
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null)

  // TODO: Replace with actual API call
  const dummyEvents = [
    {
      id: 'evt_001',
      subject_id: 'subj_user_12345',
      event_type: 'user.logged_in',
      event_time: '2024-12-18T14:30:00Z',
      payload: { ip_address: '192.168.1.100', device: 'desktop', browser: 'Chrome' },
      requires_document: false
    },
    {
      id: 'evt_002',
      subject_id: 'subj_order_67890',
      event_type: 'order.shipped',
      event_time: '2024-12-18T13:15:00Z',
      payload: { carrier: 'FedEx', tracking_number: '1Z999AA10123456784', destination: 'New York' },
      requires_document: true,
      has_document: false
    },
    {
      id: 'evt_003',
      subject_id: 'subj_user_12345',
      event_type: 'user.profile_updated',
      event_time: '2024-12-18T11:45:00Z',
      payload: { field: 'bio', old_value: null, new_value: 'Software Developer at TechCorp' },
      requires_document: false
    },
    {
      id: 'evt_004',
      subject_id: 'subj_project_abc123',
      event_type: 'project.milestone_completed',
      event_time: '2024-12-18T10:20:00Z',
      payload: { milestone: 'Phase 1 - Authentication', completion_rate: '100%', team_size: 3 },
      requires_document: true,
      has_document: true
    },
    {
      id: 'evt_005',
      subject_id: 'subj_order_67890',
      event_type: 'order.placed',
      event_time: '2024-12-17T16:00:00Z',
      payload: { total_amount: 299.99, items_count: 3, payment_method: 'credit_card' },
      requires_document: false
    }
  ]

  // Group events by date
  const eventsByDate = dummyEvents.reduce((acc, event) => {
    const date = new Date(event.event_time).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(event)
    return acc
  }, {} as Record<string, typeof dummyEvents>)

  const toggleDate = (date: string) => {
    setCollapsedDates(prev => {
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
    setExpandedEvents(prev => {
      const next = new Set(prev)
      if (next.has(eventId)) {
        next.delete(eventId)
      } else {
        next.add(eventId)
      }
      return next
    })
  }

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authState.isLoading && !authState.user) {
      navigate({ to: '/login' })
    }
  }, [authState.isLoading, authState.user, navigate])

  if (authState.isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
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

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-sm p-6 border border-slate-200/50 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Total Subjects
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  3
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +2 this week
                </p>
              </div>
              <div className="w-12 h-12 rounded-sm bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-sm p-6 border border-slate-200/50 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Total Events
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {dummyEvents.length}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +{dummyEvents.length} today
                </p>
              </div>
              <div className="w-12 h-12 rounded-sm bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-sm p-6 border border-slate-200/50 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Active Workflows
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  0
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  No change
                </p>
              </div>
              <div className="w-12 h-12 rounded-sm bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Workflow className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-sm p-6 border border-slate-200/50 dark:border-slate-700/50 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Recent Activity
            </h2>
            <button className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
              View All
            </button>
          </div>

          {/* Timeline Items */}
          {dummyEvents.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No recent activity
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(eventsByDate).map(([date, events]) => {
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
                        ({events.length} {events.length === 1 ? 'event' : 'events'})
                      </span>
                    </button>

                    {/* Events for this date */}
                    {!isDateCollapsed && (
                      <div className="ml-6 max-h-96 overflow-y-auto">
                        {events.map((event, index) => {
                          const isExpanded = expandedEvents.has(event.id)
                          const isHovered = hoveredEvent === event.id
                          const shouldShowPayload = isExpanded || isHovered

                          return (
                            <div key={event.id} className="flex gap-4">
                              {/* Timeline dot and line */}
                              <div className="flex flex-col items-center pt-1">
                                <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400" />
                                {index < events.length - 1 && (
                                  <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700 mt-2" />
                                )}
                              </div>

                              {/* Event content */}
                              <div className="flex-1 pb-2">
                                <div>
                                  <div
                                    onMouseEnter={() => setHoveredEvent(event.id)}
                                    onMouseLeave={() => setHoveredEvent(null)}
                                    onClick={() => toggleEvent(event.id)}
                                    className="flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 px-2 py-1.5 -mx-2 rounded-sm transition-colors cursor-pointer"
                                  >
                                    {/* Left side: time, subject, event */}
                                    <div className="flex items-center gap-2 flex-1">
                                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 min-w-[60px]">
                                        {new Date(event.event_time).toLocaleTimeString('en-US', {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                      <span className="text-slate-400 dark:text-slate-500">•</span>
                                      <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-sm font-mono">
                                        {event.subject_id}
                                      </span>
                                      <span className="text-slate-400 dark:text-slate-500">-</span>
                                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                        {event.event_type}
                                      </span>
                                    </div>

                                    {/* Right side: document indicator */}
                                    <div className="flex items-center gap-3">
                                      {event.requires_document && !event.has_document && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            // TODO: Handle document upload
                                          }}
                                          className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-sm transition-colors flex-shrink-0"
                                          title="Upload document"
                                        >
                                          <Upload className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                        </button>
                                      )}
                                      {event.requires_document && event.has_document && (
                                        <span title="Document attached" className="flex-shrink-0">
                                          <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Payload block - shown below event when expanded or hovered */}
                                  {shouldShowPayload && event.payload && (
                                    <div className="ml-2 mt-1 text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                                      {Object.entries(event.payload).map(([key, value]) => (
                                        <div key={key}>
                                          <span className="font-medium">{key}:</span> {String(value)}
                                        </div>
                                      ))}
                                    </div>
                                  )}
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

        {/* Quick Actions */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-sm p-6 border border-slate-200/50 dark:border-slate-700/50">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="group p-5 text-left border border-slate-200 dark:border-slate-700 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    Create Subject
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Add a new subject to track events
                  </p>
                </div>
              </div>
            </button>

            <button className="group p-5 text-left border border-slate-200 dark:border-slate-700 rounded-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    Log Event
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Record a new event in the timeline
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
