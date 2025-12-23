import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { timelineApi } from '@/lib/api-client'
import { Plus, Play, Pause, Trash2, AlertCircle, Loader2, CheckCircle } from 'lucide-react'
import { WorkflowFormModal } from '@/components/workflows/WorkflowFormModal'
import type { components } from '@/lib/timeline-api'

export const Route = createFileRoute('/settings/workflows/')({
  component: WorkflowsPage,
})

type Workflow = components['schemas']['WorkflowResponse']
type WorkflowCreate = components['schemas']['WorkflowCreate']

function WorkflowsPage() {
  const authState = useRequireAuth()
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [eventTypes, setEventTypes] = useState<string[]>([])
  const [filterEventType, setFilterEventType] = useState<string>('')
  const [hasNoAccess, setHasNoAccess] = useState(false)

  useEffect(() => {
    if (authState.user) {
      fetchWorkflows()
    }
  }, [authState.user])

  const fetchWorkflows = async () => {
    setLoading(true)
    setError(null)
    setHasNoAccess(false)
    try {
      const { data, error: apiError } = await timelineApi.workflows.list()

      if (apiError) {
        const errorObj = apiError as any
        const errorDetail = errorObj?.detail || errorObj?.message || String(apiError)
        const errorStr = errorDetail.toLowerCase()

        const isNoAccess =
          errorStr.includes('permission') ||
          errorStr.includes('401') ||
          errorStr.includes('403') ||
          errorStr.includes('unauthorized') ||
          errorStr.includes('forbidden') ||
          errorStr.includes('not allowed')

        if (isNoAccess) {
          setHasNoAccess(true)
          setError(null)
        } else {
          setError('Failed to load workflows')
        }
      } else if (data) {
        setWorkflows(data)
        const types = [
          ...new Set(
            data
              .map((w: Workflow) => {
                return (w as any).trigger?.event_type || 'unknown'
              })
              .filter((t: string) => t !== 'unknown')
          ),
        ]
        setEventTypes(types)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unexpected error loading workflows'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWorkflow = async (workflowData: WorkflowCreate) => {
    if (hasNoAccess) {
      setError('You do not have permission to create workflows')
      return false
    }

    try {
      const { data, error: apiError } = await timelineApi.workflows.create(workflowData)

      if (apiError) {
        const errorMsg =
          typeof apiError === 'object' && 'message' in apiError
            ? (apiError as any).message
            : 'Failed to create workflow'
        setError(errorMsg)
        return false
      }

      if (data) {
        setWorkflows((prev) => [data, ...prev])
        setShowCreateModal(false)
        return true
      }
      return false
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unexpected error creating workflow'
      setError(errorMsg)
      return false
    }
  }

  const handleToggleWorkflow = async () => {
    setError('Workflow toggle feature coming soon. The API endpoint for updating workflows is not yet available.')
  }

  const handleDeleteWorkflow = async (workflowId: string) => {
    if (hasNoAccess) {
      setError('You do not have permission to delete workflows')
      return
    }

    if (!confirm('Delete this workflow? This action cannot be undone.')) return

    setDeleting(workflowId)
    try {
      const { error: apiError } = await timelineApi.workflows.delete(workflowId)

      if (apiError) {
        const errorMsg =
          typeof apiError === 'object' && 'message' in apiError
            ? (apiError as any).message
            : 'Failed to delete workflow'
        setError(errorMsg)
      } else {
        setWorkflows((prev) => prev.filter((w) => w.id !== workflowId))
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete workflow'
      setError(errorMsg)
    } finally {
      setDeleting(null)
    }
  }

  if (!authState.user) {
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading workflows...</span>
        </div>
      </div>
    )
  }

  const filteredWorkflows = filterEventType
    ? workflows.filter((w: Workflow) => {
        const triggerEventType = (w as any).trigger?.event_type || ''
        return triggerEventType === filterEventType
      })
    : workflows

  return (
    <>
      {/* Create Workflow Modal */}
      {showCreateModal && !hasNoAccess && (
        <WorkflowFormModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateWorkflow}
          title="Create Workflow"
        />
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-3 p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-sm flex gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 dark:text-red-200 text-sm">Error</h3>
            <p className="text-sm text-red-800 dark:text-red-300 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* No Access Notice */}
      {hasNoAccess && (
        <div className="mb-3 p-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-sm flex gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900 dark:text-amber-200 text-sm">Limited Access</h3>
            <p className="text-sm text-amber-800 dark:text-amber-300 mt-0.5">
              You don't have permission to manage workflows. You can view existing workflows but cannot create or modify
              them.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-lg font-bold text-foreground">Workflows</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage event-driven automation workflows</p>
        </div>
        {!hasNoAccess && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Create Workflow
          </button>
        )}
      </div>

      {/* Filters */}
      {eventTypes.length > 0 && (
        <div className="bg-card/80 backdrop-blur-sm rounded-sm p-2.5 border border-border/50 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm font-medium text-foreground/90">Filter by trigger event type:</label>
            <select
              value={filterEventType}
              onChange={(e) => setFilterEventType(e.target.value)}
              className="px-3 py-1.5 bg-background border border-input rounded-sm text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Workflows</option>
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {filterEventType && (
              <button
                onClick={() => setFilterEventType('')}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Clear filter
              </button>
            )}
          </div>
        </div>
      )}

      {/* Workflows Table */}
      {filteredWorkflows.length === 0 ? (
        <div className="text-center py-8 bg-card/80 rounded-sm border border-border/50 p-4">
          <h3 className="text-sm font-semibold text-foreground mb-1">
            {hasNoAccess ? 'No workflows available' : 'No workflows yet'}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            {hasNoAccess
              ? 'You do not have permission to view or create workflows.'
              : 'Create your first workflow to automate event-driven tasks'}
          </p>
          {!hasNoAccess && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Create Workflow
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto bg-card/80 rounded-sm border border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2.5 font-medium text-muted-foreground text-sm">NAME</th>
                <th className="text-left py-2 px-2.5 font-medium text-muted-foreground text-sm">TRIGGER EVENT</th>
                <th className="text-left py-2 px-2.5 font-medium text-muted-foreground text-sm">STATUS</th>
                <th className="text-left py-2 px-2.5 font-medium text-muted-foreground text-sm">ACTIONS</th>
                <th className="text-left py-2 px-2.5 font-medium text-muted-foreground text-sm">CREATED</th>
                <th className="text-right py-2 px-2.5 font-medium text-muted-foreground text-sm">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkflows.map((workflow: Workflow) => {
                const triggerEventType = (workflow as any).trigger?.event_type || 'N/A'
                const actionsCount = (workflow as any).actions?.length || 0

                return (
                  <tr
                    key={workflow.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-2 px-2.5">
                      <span className="font-medium text-foreground">{workflow.name}</span>
                    </td>
                    <td className="py-2 px-2.5">
                      <span className="text-xs px-1.5 py-0.5 bg-secondary text-muted-foreground rounded-sm font-mono">
                        {triggerEventType}
                      </span>
                    </td>
                    <td className="py-2 px-2.5">
                      {workflow.is_active ? (
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <CheckCircle className="w-3 h-3" />
                          <span className="text-xs">Active</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Inactive</span>
                      )}
                    </td>
                    <td className="py-2 px-2.5 text-muted-foreground text-sm">
                      {actionsCount} action{actionsCount !== 1 ? 's' : ''}
                    </td>
                    <td className="py-2 px-2.5 text-muted-foreground text-sm">
                      {new Date(workflow.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-2 px-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleWorkflow()}
                          disabled={true}
                          className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors disabled:opacity-50"
                          title={workflow.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {workflow.is_active ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteWorkflow(workflow.id)}
                          disabled={deleting === workflow.id || hasNoAccess}
                          className="p-1 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-muted rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={hasNoAccess ? 'No permission to delete' : 'Delete'}
                        >
                          {deleting === workflow.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
