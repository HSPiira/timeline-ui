import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { timelineApi } from '@/lib/api-client'
import { Plus, Eye, Trash2, AlertCircle, Loader2, CheckCircle } from 'lucide-react'
import { SchemaFormModal } from '@/components/schemas/SchemaFormModal'
import { SchemaViewModal } from '@/components/schemas/SchemaViewModal'
import { DeleteSchemaModal } from '@/components/schemas/DeleteSchemaModal'
import type { components } from '@/lib/timeline-api'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/settings/schemas/')({
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
  const [deletingSchema, setDeletingSchema] = useState<Schema | null>(null)

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
        const errorMsg =
          typeof apiError === 'object' && 'message' in apiError
            ? (apiError as any).message
            : 'Failed to load schemas'
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
        const errorMsg =
          typeof apiError === 'object' && 'message' in apiError
            ? (apiError as any).message
            : 'Failed to create schema'
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

  const handleDeleteSchema = (schema: Schema) => {
    setDeletingSchema(schema)
  }

  const handleConfirmDelete = async () => {
    if (!deletingSchema) return

    try {
      const { error: apiError } = await timelineApi.eventSchemas.delete(deletingSchema.id)

      if (apiError) {
        const errorMsg =
          typeof apiError === 'object' && 'detail' in apiError
            ? (apiError as any).detail
            : typeof apiError === 'object' && 'message' in apiError
              ? (apiError as any).message
              : 'Failed to delete schema'
        throw new Error(errorMsg)
      }

      setSchemas((prev) => prev.filter((s) => s.id !== deletingSchema.id))
      setDeletingSchema(null)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete schema'
      setError(errorMsg)
      throw err
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
      {viewingSchema && <SchemaViewModal schema={viewingSchema} onClose={() => setViewingSchema(null)} />}

      {/* Delete Schema Modal */}
      {deletingSchema && (
        <DeleteSchemaModal
          isOpen={true}
          title="Delete Event Schema?"
          message="This action cannot be undone."
          itemLabel="deletion"
          details={{
            'event type': deletingSchema.event_type,
            'version': `v${deletingSchema.version}`,
            'status': deletingSchema.is_active ? 'Active' : 'Inactive',
          }}
          warning="Deletion is only possible if no events reference this schema version. If you see an error, keep this version as an inactive schema for historical verification."
          onConfirm={handleConfirmDelete}
          onClose={() => setDeletingSchema(null)}
        />
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-3 p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xs flex gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 dark:text-red-200 text-sm">Error</h3>
            <p className="text-sm text-red-800 dark:text-red-300 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-lg font-bold text-foreground">Event Schemas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage JSON schemas for event validation</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          variant="primary"
          size="md"
        >
          <Plus className="w-4 h-4" />
          Create Schema
        </Button>
      </div>

      {/* Schemas Table */}
      {schemas.length === 0 ? (
        <div className="text-center py-8 bg-card/80 rounded-xs border border-border/50 p-4">
          <h3 className="text-sm font-semibold text-foreground mb-1">No schemas yet</h3>
          <p className="text-sm text-muted-foreground mb-3">Create your first event schema to enable validation</p>
          <Button
            onClick={() => setShowCreateModal(true)}
            variant="primary"
            size="md"
          >
            <Plus className="w-4 h-4" />
            Create Schema
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-card/80 rounded-xs border border-border/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2.5 font-medium text-muted-foreground text-sm">EVENT TYPE</th>
                <th className="text-left py-2 px-2.5 font-medium text-muted-foreground text-sm">VERSION</th>
                <th className="text-left py-2 px-2.5 font-medium text-muted-foreground text-sm">STATUS</th>
                <th className="text-left py-2 px-2.5 font-medium text-muted-foreground text-sm">CREATED</th>
                <th className="text-right py-2 px-2.5 font-medium text-muted-foreground text-sm">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {schemas.map((schema) => (
                <tr
                  key={schema.id}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="py-2 px-2.5">
                    <span className="font-medium text-foreground">{schema.event_type}</span>
                  </td>
                  <td className="py-2 px-2.5 text-muted-foreground">v{schema.version}</td>
                  <td className="py-2 px-2.5">
                    {schema.is_active ? (
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckCircle className="w-3 h-3" />
                        <span className="text-xs">Active</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Inactive</span>
                    )}
                  </td>
                  <td className="py-2 px-2.5 text-muted-foreground text-sm">
                    {new Date(schema.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="py-2 px-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        onClick={() => setViewingSchema(schema)}
                        variant="ghost"
                        size="sm"
                        title="View Schema"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteSchema(schema)}
                        variant="ghost"
                        size="sm"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
