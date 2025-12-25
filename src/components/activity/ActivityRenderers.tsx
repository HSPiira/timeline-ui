import { Calendar, User, FileText, Workflow, Shield, Badge } from 'lucide-react'
import type { Activity } from '@/lib/types/activity'
import { ACTIVITY_CONFIG, RESOURCE_ICONS, formatActivityTime } from '@/lib/types/activity'

interface ActivityRendererProps {
  activity: Activity
  isSelected?: boolean
  isExpanded?: boolean
  onSelect?: (id: string) => void
  onExpand?: (id: string) => void
}

/**
 * EventActivityRenderer - Renders event activities
 */
export function EventActivityRenderer({
  activity,
  isSelected,
  isExpanded,
  onSelect,
  onExpand,
}: ActivityRendererProps) {
  const config = ACTIVITY_CONFIG[activity.action]

  return (
    <ActivityCardContainer
      activity={activity}
      config={config}
      isSelected={isSelected}
      onSelect={onSelect}
      onExpand={onExpand}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="font-medium text-sm text-foreground">
            {activity.resourceName}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {activity.resourceId.slice(0, 8)}
          </span>
        </div>
        {activity.description && (
          <p className="text-xs text-muted-foreground">{activity.description}</p>
        )}
      </div>
    </ActivityCardContainer>
  )
}

/**
 * SubjectActivityRenderer - Renders subject activities
 */
export function SubjectActivityRenderer({
  activity,
  isSelected,
  isExpanded,
  onSelect,
  onExpand,
}: ActivityRendererProps) {
  const config = ACTIVITY_CONFIG[activity.action]

  return (
    <ActivityCardContainer
      activity={activity}
      config={config}
      isSelected={isSelected}
      onSelect={onSelect}
      onExpand={onExpand}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <User className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span className="font-medium text-sm text-foreground">
            {activity.resourceName}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {activity.resourceId.slice(0, 8)}
          </span>
        </div>
        {activity.description && (
          <p className="text-xs text-muted-foreground">{activity.description}</p>
        )}
      </div>
    </ActivityCardContainer>
  )
}

/**
 * DocumentActivityRenderer - Renders document activities
 */
export function DocumentActivityRenderer({
  activity,
  isSelected,
  isExpanded,
  onSelect,
  onExpand,
}: ActivityRendererProps) {
  const config = ACTIVITY_CONFIG[activity.action]

  return (
    <ActivityCardContainer
      activity={activity}
      config={config}
      isSelected={isSelected}
      onSelect={onSelect}
      onExpand={onExpand}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span className="font-medium text-sm text-foreground">
            {activity.resourceName}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {activity.resourceId.slice(0, 8)}
          </span>
        </div>
        {activity.description && (
          <p className="text-xs text-muted-foreground">{activity.description}</p>
        )}
      </div>
    </ActivityCardContainer>
  )
}

/**
 * WorkflowActivityRenderer - Renders workflow activities
 */
export function WorkflowActivityRenderer({
  activity,
  isSelected,
  isExpanded,
  onSelect,
  onExpand,
}: ActivityRendererProps) {
  const config = ACTIVITY_CONFIG[activity.action]

  return (
    <ActivityCardContainer
      activity={activity}
      config={config}
      isSelected={isSelected}
      onSelect={onSelect}
      onExpand={onExpand}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Workflow className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span className="font-medium text-sm text-foreground">
            {activity.resourceName}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {activity.resourceId.slice(0, 8)}
          </span>
        </div>
        {activity.description && (
          <p className="text-xs text-muted-foreground">{activity.description}</p>
        )}
      </div>
    </ActivityCardContainer>
  )
}

/**
 * PermissionActivityRenderer - Renders permission activities
 */
export function PermissionActivityRenderer({
  activity,
  isSelected,
  isExpanded,
  onSelect,
  onExpand,
}: ActivityRendererProps) {
  const config = ACTIVITY_CONFIG[activity.action]

  return (
    <ActivityCardContainer
      activity={activity}
      config={config}
      isSelected={isSelected}
      onSelect={onSelect}
      onExpand={onExpand}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
          <span className="font-medium text-sm text-foreground">
            {activity.resourceName}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {activity.resourceId.slice(0, 8)}
          </span>
        </div>
        {activity.description && (
          <p className="text-xs text-muted-foreground">{activity.description}</p>
        )}
      </div>
    </ActivityCardContainer>
  )
}

/**
 * RoleActivityRenderer - Renders role activities
 */
export function RoleActivityRenderer({
  activity,
  isSelected,
  isExpanded,
  onSelect,
  onExpand,
}: ActivityRendererProps) {
  const config = ACTIVITY_CONFIG[activity.action]

  return (
    <ActivityCardContainer
      activity={activity}
      config={config}
      isSelected={isSelected}
      onSelect={onSelect}
      onExpand={onExpand}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Badge className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="font-medium text-sm text-foreground">
            {activity.resourceName}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {activity.resourceId.slice(0, 8)}
          </span>
        </div>
        {activity.description && (
          <p className="text-xs text-muted-foreground">{activity.description}</p>
        )}
      </div>
    </ActivityCardContainer>
  )
}

/**
 * Activity Renderers Registry - Strategy pattern
 */
export const ActivityRenderers: Record<
  Activity['resourceType'],
  React.ComponentType<ActivityRendererProps>
> = {
  event: EventActivityRenderer,
  subject: SubjectActivityRenderer,
  document: DocumentActivityRenderer,
  workflow: WorkflowActivityRenderer,
  permission: PermissionActivityRenderer,
  role: RoleActivityRenderer,
}

/**
 * Generic Activity Renderer - Dispatches to specific renderer based on resource type
 */
export function ActivityRenderer(props: ActivityRendererProps) {
  const Renderer = ActivityRenderers[props.activity.resourceType]
  if (!Renderer) {
    return <DefaultActivityRenderer {...props} />
  }
  return <Renderer {...props} />
}

/**
 * Default Activity Renderer - Fallback for unknown resource types
 */
function DefaultActivityRenderer({
  activity,
  isSelected,
  isExpanded,
  onSelect,
  onExpand,
}: ActivityRendererProps) {
  const config = ACTIVITY_CONFIG[activity.action]

  return (
    <ActivityCardContainer
      activity={activity}
      config={config}
      isSelected={isSelected}
      onSelect={onSelect}
      onExpand={onExpand}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-foreground">
            {activity.resourceName}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {activity.resourceId.slice(0, 8)}
          </span>
        </div>
        {activity.description && (
          <p className="text-xs text-muted-foreground">{activity.description}</p>
        )}
      </div>
    </ActivityCardContainer>
  )
}

/**
 * Reusable Activity Card Container
 */
function ActivityCardContainer({
  activity,
  config,
  isSelected,
  onSelect,
  onExpand,
  children,
}: ActivityRendererProps & {
  config: (typeof ACTIVITY_CONFIG)[keyof typeof ACTIVITY_CONFIG]
  children: React.ReactNode
}) {
  return (
    <div
      onClick={() => onSelect?.(activity.id)}
      className={`p-3 rounded-xs border transition-colors cursor-pointer ${
        isSelected
          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
          : 'border-border hover:border-blue-300 dark:hover:border-blue-700 hover:bg-muted/30'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Priority indicator */}
        <div
          className={`w-1 h-1 rounded-full mt-2 flex-shrink-0 ${
            activity.priority === 'high'
              ? 'bg-red-500'
              : activity.priority === 'medium'
                ? 'bg-amber-500'
                : 'bg-slate-400'
          }`}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0">{children}</div>

        {/* Action badge and time */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs px-2 py-1 rounded-xs font-medium ${config.color}`}>
            {config.label}
          </span>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatActivityTime(activity.timestamp)}
          </span>
        </div>
      </div>

      {/* Metadata */}
      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
        <div className="mt-2 ml-4 text-xs text-muted-foreground space-y-1">
          {Object.entries(activity.metadata).slice(0, 3).map(([key, value]) => (
            <div key={key}>
              <strong>{key}:</strong> {String(value)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
