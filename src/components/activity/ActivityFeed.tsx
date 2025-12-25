import { useCallback, useEffect, useMemo, useState } from 'react'
import { Calendar, Loader2, AlertCircle, Wifi, WifiOff } from 'lucide-react'
import { useActivityFeed } from '@/hooks/useActivityFeed'
import { useActivitySubscription, useSimulatedActivityStream } from '@/hooks/useActivitySubscription'
import { ActivityRenderer } from './ActivityRenderers'
import { ActivityProvider, useActivityContext } from '@/context/ActivityContext'
import type { ActivityFilter, Activity } from '@/lib/types/activity'

interface ActivityFeedProps {
  filter?: ActivityFilter
  limit?: number
}

/**
 * Main Activity Feed Component
 * Wraps the actual feed in provider for context
 */
export function ActivityFeed({
  filter,
  limit = 20,
  ...props
}: ActivityFeedProps & { enableRealTime?: boolean; useSimulation?: boolean }) {
  return (
    <ActivityProvider>
      <ActivityFeedContent filter={filter} limit={limit} {...props} />
    </ActivityProvider>
  )
}

interface ActivityFeedContentProps extends ActivityFeedProps {
  enableRealTime?: boolean
  useSimulation?: boolean
}

/**
 * Activity Feed Content - Inner component with context access
 */
function ActivityFeedContent({
  filter,
  limit,
  enableRealTime = true,
  useSimulation = false,
}: ActivityFeedContentProps) {
  const { selected, setSelected, expanded, toggleExpanded } = useActivityContext()
  const { feed, loading, error, fetchMore, addActivity } = useActivityFeed({
    limit,
    filter,
    autoFetch: true,
  })
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>(
    'disconnected'
  )

  /**
   * Handle new activities from real-time subscription
   */
  const handleNewActivity = useCallback(
    (activity: Activity) => {
      addActivity(activity)
    },
    [addActivity]
  )

  /**
   * Set up WebSocket subscription
   */
  const subscription = useActivitySubscription(
    enableRealTime
      ? {
          enabled: !useSimulation,
          onNewActivity: handleNewActivity,
          onError: err => {
            console.error('WebSocket error:', err)
            setWsStatus('disconnected')
          },
        }
      : undefined
  )

  /**
   * Use simulated activity stream for testing
   */
  useSimulatedActivityStream(handleNewActivity, useSimulation)

  // Update WS status when subscription state changes
  useEffect(() => {
    if (enableRealTime && !useSimulation) {
      setWsStatus(
        subscription?.isConnected
          ? 'connected'
          : subscription?.isReconnecting
            ? 'connecting'
            : 'disconnected'
      )
    }
  }, [subscription?.isConnected, subscription?.isReconnecting, enableRealTime, useSimulation])

  const hasActivities = feed.items.length > 0

  if (loading && !hasActivities) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm">Loading activities...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    )
  }

  if (!hasActivities) {
    return (
      <div className="bg-card/80 backdrop-blur-sm rounded-xs p-12 border border-border/50 text-center">
        <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No activities yet
        </h3>
        <p className="text-muted-foreground">
          Activities will appear here as events occur in the system
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Connection status indicator */}
      {enableRealTime && !useSimulation && (
        <div className="flex items-center justify-between px-3 py-2 text-xs rounded-xs bg-muted/30 border border-border/50">
          <div className="flex items-center gap-2">
            {wsStatus === 'connected' && (
              <>
                <Wifi className="w-3 h-3 text-green-600 dark:text-green-400" />
                <span className="text-muted-foreground">Real-time updates active</span>
              </>
            )}
            {wsStatus === 'connecting' && (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-amber-600 dark:text-amber-400" />
                <span className="text-muted-foreground">Connecting...</span>
              </>
            )}
            {wsStatus === 'disconnected' && (
              <>
                <WifiOff className="w-3 h-3 text-red-600 dark:text-red-400" />
                <span className="text-muted-foreground">Offline - showing cached activities</span>
              </>
            )}
          </div>
          {subscription?.reconnectAttempts > 0 && wsStatus === 'disconnected' && (
            <span className="text-xs text-muted-foreground">
              Retries: {subscription.reconnectAttempts}/5
            </span>
          )}
        </div>
      )}

      {/* Simulation badge */}
      {useSimulation && (
        <div className="flex items-center gap-2 px-3 py-2 text-xs rounded-xs bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
          <span className="text-blue-700 dark:text-blue-300">
            🧪 Using simulated activities for demo
          </span>
        </div>
      )}

      {/* Activity items */}
      {feed.items.map(activity => (
        <ActivityRenderer
          key={activity.id}
          activity={activity}
          isSelected={selected === activity.id}
          isExpanded={expanded.has(activity.id)}
          onSelect={setSelected}
          onExpand={toggleExpanded}
        />
      ))}

      {/* Load more button */}
      {feed.hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={fetchMore}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xs transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading more...
              </div>
            ) : (
              `Load More (${feed.total - feed.items.length} remaining)`
            )}
          </button>
        </div>
      )}

      {/* Activity count */}
      {feed.total > 0 && (
        <div className="text-xs text-muted-foreground text-center pt-2">
          Showing {feed.items.length} of {feed.total} activities
        </div>
      )}
    </div>
  )
}

/**
 * Activity Feed by Date Groups
 * Organizes activities into collapsible date groups
 */
export function ActivityFeedByDate({ filter, limit = 20 }: ActivityFeedProps) {
  return (
    <ActivityProvider>
      <ActivityFeedByDateContent filter={filter} limit={limit} />
    </ActivityProvider>
  )
}

/**
 * Activity Feed by Date Content
 */
function ActivityFeedByDateContent({ filter, limit }: ActivityFeedProps) {
  const { selected, setSelected, expanded, toggleExpanded } = useActivityContext()
  const { feed, loading, error } = useActivityFeed({
    limit: 1000, // Load all for grouping
    filter,
    autoFetch: true,
  })

  const hasActivities = feed.items.length > 0

  // Group activities by date
  const groupedActivities = useMemo(() => {
    const groups: Record<string, typeof feed.items> = {}

    feed.items.forEach(activity => {
      const date = activity.timestamp.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(activity)
    })

    return groups
  }, [feed.items])

  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set())

  const toggleDateCollapsed = useCallback((date: string) => {
    setCollapsedDates(prev => {
      const newSet = new Set(prev)
      if (newSet.has(date)) {
        newSet.delete(date)
      } else {
        newSet.add(date)
      }
      return newSet
    })
  }, [])

  if (loading && !hasActivities) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm">Loading activities...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    )
  }

  if (!hasActivities) {
    return (
      <div className="bg-card/80 backdrop-blur-sm rounded-xs p-12 border border-border/50 text-center">
        <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No activities yet
        </h3>
        <p className="text-muted-foreground">
          Activities will appear here as events occur in the system
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedActivities).map(([date, activities]) => {
        const isCollapsed = collapsedDates.has(date)

        return (
          <div key={date}>
            {/* Date header with collapse toggle */}
            <button
              onClick={() => toggleDateCollapsed(date)}
              className="flex items-center gap-2 mb-3 px-2 py-1 hover:bg-muted/30 rounded-xs transition-colors"
            >
              <span
                className={`transform transition-transform ${
                  isCollapsed ? '' : 'rotate-90'
                }`}
              >
                ▶
              </span>
              <span className="font-semibold text-foreground">{date}</span>
              <span className="text-xs text-muted-foreground">
                ({activities.length})
              </span>
            </button>

            {/* Activities list */}
            {!isCollapsed && (
              <div className="ml-4 space-y-2 max-h-96 overflow-y-auto">
                {activities.map(activity => (
                  <ActivityRenderer
                    key={activity.id}
                    activity={activity}
                    isSelected={selected === activity.id}
                    isExpanded={expanded.has(activity.id)}
                    onSelect={setSelected}
                    onExpand={toggleExpanded}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
