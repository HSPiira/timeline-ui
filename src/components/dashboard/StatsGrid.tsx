import { Users, Calendar, Workflow } from 'lucide-react'
import { StatCard } from '../shared/StatCard'

interface StatsGridProps {
  totalSubjects: number
  subjectsThisWeek: number
  totalEvents: number
  activeWorkflows: number
}

export function StatsGrid({
  totalSubjects,
  subjectsThisWeek,
  totalEvents,
  activeWorkflows
}: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard
        label="Total Subjects"
        value={totalSubjects}
        subtitle={`+${subjectsThisWeek} this week`}
        icon={Users}
      />

      <StatCard
        label="Total Events"
        value={totalEvents}
        subtitle={`+${totalEvents} today`}
        icon={Calendar}
      />

      <StatCard
        label="Active Workflows"
        value={activeWorkflows}
        subtitle="No change"
        icon={Workflow}
      />
    </div>
  )
}
