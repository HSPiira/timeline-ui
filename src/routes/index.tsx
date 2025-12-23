import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { useTimelineState } from '@/hooks/useTimelineState'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { StatsGrid } from '@/components/dashboard/StatsGrid'
import { timelineApi } from '@/lib/api-client'
import { Loader2, AlertCircle } from 'lucide-react'
import type { EventResponse, SubjectResponse, WorkflowResponse } from '@/lib/types'

export const Route = createFileRoute('/')({
  component: HomePage,
})

interface DashboardData {
  events: EventResponse[]
  subjects: SubjectResponse[]
  workflows: WorkflowResponse[]
}

interface FetchError {
  field: 'events' | 'subjects' | 'workflows'
  message: string
}

function HomePage() {
  const authState = useRequireAuth()
  const timeline = useTimelineState()

  const [data, setData] = useState<DashboardData>({
    events: [],
    subjects: [],
    workflows: [],
  })
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<FetchError[]>([])

  // Group events by date
  const eventsByDate = useMemo(() => {
    return data.events.reduce((acc: Record<string, EventResponse[]>, event) => {
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
    }, {})
  }, [data.events])

  // Calculate today's events
  const eventsToday = useMemo(() => {
    const today = new Date().toDateString()
    return data.events.filter((event) => new Date(event.event_time).toDateString() === today)
  }, [data.events])

  // Calculate subjects created this week
  const subjectsThisWeek = useMemo(() => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return data.subjects.filter((subject) => {
      const created = new Date((subject as any).created_at || (subject as any).created)
      return created >= weekAgo
    })
  }, [data.subjects])

  // Count active workflows
  const activeWorkflowsCount = useMemo(() => {
    return data.workflows.filter((workflow) => (workflow as any).is_active).length
  }, [data.workflows])

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    setErrors([])
    try {
      const results = await Promise.allSettled([
        timelineApi.events.listAll(),
        timelineApi.subjects.list(),
        timelineApi.workflows.list(),
      ])

      const newErrors: FetchError[] = []
      const newData: DashboardData = {
        events: [],
        subjects: [],
        workflows: [],
      }

      // Process events response
      const eventsResult = results[0]
      if (eventsResult.status === 'fulfilled' && eventsResult.value.data) {
        newData.events = eventsResult.value.data
      } else if (eventsResult.status === 'rejected') {
        newErrors.push({
          field: 'events',
          message: 'Failed to load events',
        })
      }

      // Process subjects response
      const subjectsResult = results[1]
      if (subjectsResult.status === 'fulfilled' && subjectsResult.value.data) {
        newData.subjects = subjectsResult.value.data
      } else if (subjectsResult.status === 'rejected') {
        newErrors.push({
          field: 'subjects',
          message: 'Failed to load subjects',
        })
      }

      // Process workflows response
      const workflowsResult = results[2]
      if (workflowsResult.status === 'fulfilled' && workflowsResult.value.data) {
        newData.workflows = workflowsResult.value.data
      } else if (workflowsResult.status === 'rejected') {
        newErrors.push({
          field: 'workflows',
          message: 'Failed to load workflows',
        })
      }

      setData(newData)
      setErrors(newErrors)
    } catch (err) {
      console.error('Unexpected error fetching dashboard:', err)
      setErrors([
        {
          field: 'events',
          message: 'An unexpected error occurred while loading dashboard',
        },
      ])
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch data on user login and set up auto-refresh interval
  useEffect(() => {
    if (authState.user) {
      fetchDashboard()

      // Auto-refresh every 5 seconds
      const interval = setInterval(() => {
        fetchDashboard()
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [authState.user, fetchDashboard])

  if (authState.isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  if (!authState.user) {
    return null
  }

  const hasErrors = errors.length > 0

  return (
    <>

        {/* Error messages */}
        {hasErrors && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 dark:text-red-200 mb-2">
                  Unable to load some data
                </h3>
                <ul className="space-y-1 text-sm text-red-800 dark:text-red-300">
                  {errors.map((error) => (
                    <li key={error.field}>
                      • {error.field.charAt(0).toUpperCase() + error.field.slice(1)}: {error.message}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={fetchDashboard}
                  className="mt-3 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <StatsGrid
          totalSubjects={data.subjects.length}
          subjectsThisWeek={subjectsThisWeek.length}
          totalEvents={data.events.length}
          eventsToday={eventsToday.length}
          activeWorkflows={activeWorkflowsCount}
        />

        {/* Recent Activity */}
        <div className="bg-card/80 backdrop-blur-sm rounded-sm p-6 border border-border/50">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Recent Activity
          </h2>
          {loading && Object.keys(eventsByDate).length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading events...</span>
              </div>
            </div>
          ) : (
            <RecentActivity eventsByDate={eventsByDate} timeline={timeline} />
          )}
        </div>
    </>
  )
}
