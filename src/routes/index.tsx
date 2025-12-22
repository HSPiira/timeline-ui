import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { useTimelineState } from '@/hooks/useTimelineState'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { StatsGrid } from '@/components/dashboard/StatsGrid'
// import { timelineApi } from '@/lib/api-client'
import { dummyEvents, dummyStats } from '@/lib/dummy-data'
import { Loader2 } from 'lucide-react'
import type { EventResponse } from '@/lib/types'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const authState = useRequireAuth()
  const timeline = useTimelineState()

  // TODO: Replace with real API calls
  // const fetchData = async () => {
  //   const [eventsRes, subjectsRes, workflowsRes] = await Promise.all([
  //     timelineApi.events.listAll(),
  //     timelineApi.subjects.list(),
  //     timelineApi.workflows.list(),
  //   ])
  //   setEvents(eventsRes.data || [])
  //   setSubjects(subjectsRes.data || [])
  //   setWorkflows(workflowsRes.data || [])
  // }

  // Using dummy data for now
  const events = dummyEvents
  const stats = dummyStats

  // Group events by date
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

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
