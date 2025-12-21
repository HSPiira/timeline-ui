import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, useMemo } from 'react'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { useTimelineState } from '@/hooks/useTimelineState'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { StatsGrid } from '@/components/dashboard/StatsGrid'
import { timelineApi } from '@/lib/api-client'
import { dummyEvents, dummyStats } from '@/lib/dummy-data'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import type { EventResponse, SubjectResponse, WorkflowResponse } from '@/lib/types'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const authState = useRequireAuth()
  const timeline = useTimelineState()

  const [events, setEvents] = useState<EventResponse[]>([])
  const [subjects, setSubjects] = useState<SubjectResponse[]>([])
  const [workflows, setWorkflows] = useState<WorkflowResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useDummyData, setUseDummyData] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch events, subjects, and workflows in parallel
      const [eventsRes, subjectsRes, workflowsRes] = await Promise.all([
        timelineApi.events.listAll(),
        timelineApi.subjects.list(),
        timelineApi.workflows.list(),
      ])

      if (eventsRes.error) {
        throw new Error('Failed to fetch events')
      }

      if (subjectsRes.error) {
        throw new Error('Failed to fetch subjects')
      }

      if (workflowsRes.error) {
        throw new Error('Failed to fetch workflows')
      }

      setEvents(eventsRes.data || [])
      setSubjects(subjectsRes.data || [])
      setWorkflows(workflowsRes.data || [])
      setUseDummyData(false)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      // Fall back to dummy data
      setEvents(dummyEvents)
      setUseDummyData(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authState.user) {
      fetchData()
    }
  }, [authState.user])

  // Group events by date with proper memoization
  const eventsByDate = useMemo(() => {
    return events.reduce((acc: Record<string, EventResponse[]>, event) => {
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
  }, [events])

  // Calculate stats
  const stats = useMemo(() => {
    if (useDummyData) {
      return dummyStats
    }

    return {
      totalSubjects: subjects.length,
      subjectsThisWeek: 0, // TODO: Calculate based on created_at
      totalEvents: events.length,
      activeWorkflows: workflows.filter((w) => w.is_active).length,
    }
  }, [subjects, events, workflows, useDummyData])

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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (error && !useDummyData) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 rounded-sm bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Unable to Load Dashboard
          </h3>
          <p className="text-muted-foreground mb-6">
            {error}. Please check your connection and try again.
          </p>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header with Refresh */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-muted-foreground">
            {useDummyData && (
              <span className="text-amber-600 dark:text-amber-500">
                Using demo data - API unavailable
              </span>
            )}
          </p>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <StatsGrid
          totalSubjects={stats.totalSubjects}
          subjectsThisWeek={stats.subjectsThisWeek}
          totalEvents={stats.totalEvents}
          activeWorkflows={stats.activeWorkflows}
        />

        <div className="bg-card/80 backdrop-blur-sm rounded-sm p-6 border border-border/50">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Recent Activity
          </h2>
          <RecentActivity eventsByDate={eventsByDate} timeline={timeline} />
        </div>
      </div>
    </div>
  )
}
