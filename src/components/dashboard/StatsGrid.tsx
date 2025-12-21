import { Users, Calendar, Workflow } from 'lucide-react'
import { StatCard } from '../shared/StatCard'

export function StatsGrid({ totalEvents }: { totalEvents: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Subjects */}
      <StatCard 
      label="Total Subjects" 
      value={3} 
      subtitle="+2 this week" 
      icon={Users} />

      {/* Total Events */}
      <StatCard 
      label="Total Events" 
      value={totalEvents} 
      subtitle={`+${totalEvents} today`} 
      icon={Calendar} />

      {/* Active Workflows */}
      <StatCard 
      label="Active Workflows" 
      value={0} 
      subtitle="No change" 
      icon={Workflow} />
    </div>
  )
}
