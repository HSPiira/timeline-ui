import { useActivityAnalytics } from '@/hooks/useActivityAnalytics'
import type { Activity } from '@/lib/types/activity'
import { BarChart3, TrendingUp, Users, Zap } from 'lucide-react'

interface ActivityAnalyticsProps {
  activities: Activity[]
  compact?: boolean
}

/**
 * Analytics dashboard for activity feed
 * Displays key statistics and trending insights
 */
export function ActivityAnalytics({ activities, compact = false }: ActivityAnalyticsProps) {
  const { stats, trends } = useActivityAnalytics(activities)

  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          icon={BarChart3}
          label="Total Activities"
          value={stats.total.toString()}
          color="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          icon={Zap}
          label="Last Hour"
          value={trends.averagePerHour.toString()}
          color="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Most Common"
          value={trends.mostCommonAction?.action || 'N/A'}
          color="text-green-600 dark:text-green-400"
        />
        <StatCard
          icon={Users}
          label="Top User"
          value={trends.mostActiveUser?.userId.substring(5) || 'N/A'}
          color="text-purple-600 dark:text-purple-400"
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          icon={BarChart3}
          label="Total Activities"
          value={stats.total.toString()}
          color="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          icon={Zap}
          label="Activities Last Hour"
          value={trends.averagePerHour.toString()}
          color="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Most Common Action"
          value={trends.mostCommonAction?.action || 'N/A'}
          subtext={trends.mostCommonAction ? `${trends.mostCommonAction.count} times` : ''}
          color="text-green-600 dark:text-green-400"
        />
        <StatCard
          icon={Users}
          label="Top Active User"
          value={trends.mostActiveUser?.userId.substring(5) || 'N/A'}
          subtext={trends.mostActiveUser ? `${trends.mostActiveUser.count} activities` : ''}
          color="text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Action breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card/50 rounded-xs border border-border/50 p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">Activities by Action</h4>
          <div className="space-y-2">
            {Object.entries(stats.byAction)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([action, count]) => (
                <div key={action} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground capitalize">{action}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{
                          width: `${(count / Math.max(...Object.values(stats.byAction))) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="w-8 text-right font-medium text-foreground">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Resource type breakdown */}
        <div className="bg-card/50 rounded-xs border border-border/50 p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">Activities by Resource</h4>
          <div className="space-y-2">
            {Object.entries(stats.byResourceType)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([resourceType, count]) => (
                <div key={resourceType} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground capitalize">{resourceType}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500"
                        style={{
                          width: `${(count / Math.max(...Object.values(stats.byResourceType))) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="w-8 text-right font-medium text-foreground">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  subtext?: string
  color: string
}

function StatCard({ icon: Icon, label, value, subtext, color }: StatCardProps) {
  return (
    <div className="bg-card/50 rounded-xs border border-border/50 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="text-lg font-semibold text-foreground">{value}</p>
      {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
    </div>
  )
}

export default ActivityAnalytics
