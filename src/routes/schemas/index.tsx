import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { timelineApi } from '@/lib/api-client'
import { Plus, Eye, Trash2, AlertCircle, Loader2, CheckCircle } from 'lucide-react'
import { SchemaFormModal } from '@/components/schemas/SchemaFormModal'
import { SchemaViewModal } from '@/components/schemas/SchemaViewModal'
import type { components } from '@/lib/timeline-api'

export const Route = createFileRoute('/schemas/')({
  component: SchemasPage,
})

type Schema = components['schemas']['EventSchemaResponse']

function SchemasPage() {
  const authState = useRequireAuth()
  const [schemas, setSchemas] = useState<Schema[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [viewingSchema, setViewingSchema] = useState<Schema | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (authState.user) {
      fetchSchemas()
    }
  }, [authState.user])

  const fetchSchemas = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: apiError } = await timelineApi.eventSchemas.list()

      if (apiError) {
        const errorMsg = typeof apiError === 'object' && 'message' in apiError ? (apiError as any).message : 'Failed to load schemas'
        setError(errorMsg)
      } else if (data) {
        setSchemas(data)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unexpected error loading schemas'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSchema = async (eventType: string, definition: Record<string, any>) => {
    try {
      const { data, error: apiError } = await timelineApi.eventSchemas.create({
        event_type: eventType,
        schema_definition: definition,
        version: 1,
      } as any)

      if (apiError) {
        const errorMsg = typeof apiError === 'object' && 'message' in apiError ? (apiError as any).message : 'Failed to create schema'
        setError(errorMsg)
        return false
      }

      if (data) {
        setSchemas((prev) => [data, ...prev])
        setShowCreateModal(false)
        return true
      }
      return false
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unexpected error creating schema'
      setError(errorMsg)
      return false
    }
  }

  const handleDeleteSchema = async (schemaId: string) => {
    if (!confirm('Delete this schema? This action cannot be undone.')) return

    setDeleting(schemaId)
    try {
      // Since API doesn't have explicit delete, we'll just remove from UI
      // In a real app, call the delete endpoint
      setSchemas((prev) => prev.filter((s) => s.id !== schemaId))
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete schema'
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
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading schemas...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Create Schema Modal */}
      {showCreateModal && (
        <SchemaFormModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateSchema}
          title="Create Event Schema"
        />
      )}

      {/* View/Edit Schema Modal */}
      {viewingSchema && (
        <SchemaViewModal
          schema={viewingSchema}
          onClose={() => setViewingSchema(null)}
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

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-lg font-bold text-foreground">Event Schemas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage JSON schemas for event validation</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-sm bg-primary text-primary-foreground rounded-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Create Schema
        </button>
      </div>

      {/* Schemas Table */}
      {schemas.length === 0 ? (
        <div className="text-center py-6 bg-card/80 rounded-sm border border-border/50 p-3">
          <h3 className="text-sm font-semibold text-foreground mb-1">No schemas yet</h3>
          <p className="text-sm text-muted-foreground mb-2">Create your first event schema to enable validation</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-sm bg-primary text-primary-foreground rounded-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Create Schema
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-card/80 rounded-sm border border-border/50">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-1 px-2.5 font-medium text-muted-foreground text-xs">Event Type</th>
                <th className="text-left py-1 px-2.5 font-medium text-muted-foreground text-xs">Version</th>
                <th className="text-left py-1 px-2.5 font-medium text-muted-foreground text-xs">Status</th>
                <th className="text-left py-1 px-2.5 font-medium text-muted-foreground text-xs">Created</th>
                <th className="text-right py-1 px-2.5 font-medium text-muted-foreground text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schemas.map((schema) => (
                <tr key={schema.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-1 px-2.5">
                    <span className="font-medium text-foreground text-xs">{schema.event_type}</span>
                  </td>
                  <td className="py-1 px-2.5">
                    <span className="text-muted-foreground text-xs">v{schema.version}</span>
                  </td>
                  <td className="py-1 px-2.5">
                    <div className="flex items-center gap-0.5">
                      {schema.is_active ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-green-600 dark:text-green-400 text-xs">Active</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground text-xs">Inactive</span>
                      )}
                    </div>
                  </td>
                  <td className="py-1 px-2.5 text-muted-foreground text-xs">
                    {new Date(schema.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="py-1 px-2.5">
                    <div className="flex items-center justify-end gap-0.5">
                      <button
                        onClick={() => setViewingSchema(schema)}
                        className="p-1 hover:bg-muted rounded-sm transition-colors"
                        title="View Schema"
                      >
                        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleDeleteSchema(schema.id)}
                        disabled={deleting === schema.id}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-sm transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deleting === schema.id ? (
                          <Loader2 className="w-3.5 h-3.5 text-red-500 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
