import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Calendar, Tag, Loader2, AlertCircle, ChevronDown, ChevronRight, Activity, FileText, Shield } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useStore } from '@tanstack/react-store'
import { timelineApi } from '@/lib/api-client'
import { authStore } from '@/lib/auth-store'
import { DocumentUpload } from '@/components/documents/DocumentUpload'
import { DocumentList } from '@/components/documents/DocumentList'
import { DocumentViewer } from '@/components/documents/DocumentViewer'
import type { SubjectResponse, EventResponse } from '@/lib/types'

export const Route = createFileRoute('/events/subject/$subjectId')({
  component: SubjectEventsPage,
})

type Tab = 'events' | 'documents'

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
  const [activeTab, setActiveTab] = useState<Tab>('events')
  const [viewingDocument, setViewingDocument] = useState<{ id: string; filename: string; type: string } | null>(null)

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
        // @ts-expect-error - openapi-fetch error handling
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
        // @ts-expect-error - openapi-fetch error handling
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
          <span>Loading timeline...</span>
        </div>
      </div>
    )
  }

  if (error || !subject) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 rounded-sm bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Unable to Load Subject
          </h3>
          <p className="text-muted-foreground mb-6">
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
              className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to Subjects
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Document Viewer Modal */}
      {viewingDocument && (
        <DocumentViewer
          documentId={viewingDocument.id}
          filename={viewingDocument.filename}
          fileType={viewingDocument.type}
          onClose={() => setViewingDocument(null)}
        />
      )}
        {/* Back Button */}
        <button
          onClick={() => navigate({ to: '/subjects' })}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Subjects</span>
        </button>

        {/* Subject Header */}
        <div className="bg-card/80 backdrop-blur-sm rounded-sm p-4 border border-border/50 mb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">
                {subject.id}
              </h1>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  <span className="font-medium">{subject.subject_type}</span>
                </div>
                {subject.external_ref && (
                  <div className="flex items-center gap-1">
                    <span>Ref:</span>
                    <span className="font-mono">{subject.external_ref}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Created {new Date(subject.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total Events</p>
              <p className="text-2xl font-bold text-foreground">
                {events.length}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <button
              onClick={() => navigate({ to: `/verify/${subjectId}` })}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Shield className="w-3 h-3" />
              Verify Chain
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-3 border-b border-border">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 ${
              activeTab === 'events'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Events
            </span>
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 ${
              activeTab === 'documents'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents
            </span>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'events' && (
        <div className="bg-card/80 backdrop-blur-sm rounded-sm p-4 border border-border/50">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            Event Timeline
          </h2>

          {events.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No events recorded for this subject yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(eventsByDate).map(([date, dateEvents]) => {
                const isDateCollapsed = collapsedDates.has(date)

                return (
                  <div key={date}>
                    {/* Date Header */}
                    <button
                      onClick={() => toggleDate(date)}
                      className="flex items-center gap-2 w-full text-left mb-2 group"
                    >
                      {isDateCollapsed ? (
                        <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                      )}
                      <span className="text-xs font-semibold text-foreground/90">
                        {date}
                      </span>
                      <span className="text-xs text-muted-foreground/70">
                        ({dateEvents.length} {dateEvents.length === 1 ? 'event' : 'events'})
                      </span>
                    </button>

                    {/* Events for this date */}
                    {!isDateCollapsed && (
                      <div className="ml-4 space-y-2">
                        {dateEvents.map((event, index) => {
                          const isExpanded = expandedEvents.has(event.id)

                          return (
                            <div key={event.id} className="flex gap-3">
                              {/* Timeline dot and line */}
                              <div className="flex flex-col items-center pt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-foreground/60" />
                                {index < dateEvents.length - 1 && (
                                  <div className="w-0.5 flex-1 bg-secondary mt-1 min-h-[40px]" />
                                )}
                              </div>

                              {/* Event content */}
                              <div className="flex-1 pb-2">
                                <div
                                  onClick={() => toggleEvent(event.id)}
                                  className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-sm border border-slate-200 dark:border-slate-700 hover:border-border transition-colors cursor-pointer"
                                >
                                  <div className="flex items-start justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                        {new Date(event.event_time).toLocaleTimeString('en-US', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          second: '2-digit',
                                        })}
                                      </span>
                                      <span className="text-xs font-semibold text-foreground">
                                        {event.event_type}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs px-1.5 py-0.5 bg-secondary text-muted-foreground rounded-sm font-mono">
                                        {event.id.slice(0, 8)}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Payload - shown when expanded */}
                                  {isExpanded && event.payload && (
                                    <div className="mt-2 p-2 bg-white dark:bg-slate-800 rounded-sm border border-slate-200 dark:border-slate-700">
                                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                                        Event Data
                                      </p>
                                      <pre className="text-xs text-foreground/90 overflow-x-auto">
                                        {JSON.stringify(event.payload, null, 2)}
                                      </pre>
                                    </div>
                                  )}

                                  <div className="mt-1 text-xs text-muted-foreground">
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
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
        <div className="space-y-4">
          {/* Upload Section */}
          <div className="bg-card/80 backdrop-blur-sm rounded-sm p-4 border border-border/50">
            <h2 className="text-sm font-semibold text-foreground mb-4">Upload Documents</h2>
            <DocumentUpload
              subjectId={subjectId}
              onError={(error) => console.error('Upload error:', error)}
            />
          </div>

          {/* Documents List */}
          <div className="bg-card/80 backdrop-blur-sm rounded-sm p-4 border border-border/50">
            <h2 className="text-sm font-semibold text-foreground mb-4">Documents</h2>
            <DocumentList
              subjectId={subjectId}
              onError={(error) => console.error('Documents error:', error)}
            />
          </div>
        </div>
        )}
    </>
  )
}
