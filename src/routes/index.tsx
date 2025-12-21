import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { useTimelineState } from '@/hooks/useTimelineState'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { StatsGrid } from '@/components/dashboard/StatsGrid'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const authState = useRequireAuth()
  const timeline = useTimelineState()

  if (authState.isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-pulse" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  if (!authState.user) {
    return null
  }

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
  const eventsByDate = useMemo<Record<string, typeof dummyEvents>>(
    () => { return dummyEvents.reduce((acc: Record<string, any[]>, event: any) => {
      const date = new Date(event.event_time).toDateString()
      acc[date] = acc[date] || []
      acc[date].push(event)
      return acc
    }, {})
    }, [dummyEvents])

    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <StatsGrid totalEvents={dummyEvents.length} />
          <RecentActivity eventsByDate={eventsByDate} timeline={timeline} />
        </div>
      </div>
    )
}
