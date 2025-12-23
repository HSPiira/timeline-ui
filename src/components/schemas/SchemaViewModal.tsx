import { useState } from 'react'
import { X } from 'lucide-react'
import type { components } from '@/lib/timeline-api'

type Schema = components['schemas']['EventSchemaResponse']

interface SchemaViewModalProps {
  schema: Schema
  onClose: () => void
}

type ViewMode = 'simplified' | 'json'

export function SchemaViewModal({ schema, onClose }: SchemaViewModalProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('simplified')

  const properties = schema.schema_definition.properties as Record<string, any> || {}
  const required = schema.schema_definition.required as string[] || []

  const getFieldType = (fieldSchema: any): string => {
    if (fieldSchema.enum) {
      return `Dropdown (${fieldSchema.enum.length} options)`
    }
    if (fieldSchema.format) {
      return fieldSchema.format
    }
    if (fieldSchema.type === 'number' && (fieldSchema.minimum !== undefined || fieldSchema.maximum !== undefined)) {
      const constraints = []
      if (fieldSchema.minimum !== undefined) constraints.push(`min: ${fieldSchema.minimum}`)
      if (fieldSchema.maximum !== undefined) constraints.push(`max: ${fieldSchema.maximum}`)
      return `Number (${constraints.join(', ')})`
    }
    return fieldSchema.type || 'unknown'
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-sm max-w-2xl w-full max-h-[90vh] overflow-auto p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{schema.event_type}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Version {schema.version}</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground/70 hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border text-xs">
          <div>
            <span className="text-muted-foreground">Status: </span>
            {schema.is_active ? (
              <span className="text-green-600 dark:text-green-400 font-medium">Active</span>
            ) : (
              <span className="text-muted-foreground">Inactive</span>
            )}
          </div>
          <div>
            <span className="text-muted-foreground">Created: </span>
            <span className="text-foreground">
              {new Date(schema.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-1 mb-4 border-b border-border">
          <button
            onClick={() => setViewMode('simplified')}
            className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
              viewMode === 'simplified'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Field View
          </button>
          <button
            onClick={() => setViewMode('json')}
            className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
              viewMode === 'json'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            JSON
          </button>
        </div>

        {/* Content */}
        <div className="mb-4 max-h-[calc(90vh-280px)] overflow-auto">
          {viewMode === 'simplified' ? (
            <div className="space-y-3">
              {Object.keys(properties).length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No fields defined</p>
              ) : (
                Object.entries(properties).map(([fieldName, fieldSchema]) => (
                  <div key={fieldName} className="p-3 bg-background/50 border border-border rounded-sm">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground text-sm">{fieldName}</span>
                        <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded">
                          {getFieldType(fieldSchema)}
                        </span>
                        {required.includes(fieldName) && (
                          <span className="px-1.5 py-0.5 text-xs font-medium bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded">
                            Required
                          </span>
                        )}
                      </div>
                    </div>
                    {fieldSchema.description && (
                      <p className="text-xs text-muted-foreground mt-1">{fieldSchema.description}</p>
                    )}
                    {fieldSchema.enum && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Options: {fieldSchema.enum.join(', ')}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="p-3 bg-background/50 rounded-sm border border-border/50 overflow-auto">
              <pre className="text-xs text-foreground/90 font-mono whitespace-pre-wrap break-words">
                {JSON.stringify(schema.schema_definition, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Info Note */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-sm mb-4">
          <p className="text-xs text-blue-900 dark:text-blue-200">
            This is a read-only view. To modify this schema, create a new version with the Create Schema button.
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-4 py-2 border border-input text-foreground/90 rounded-sm font-medium hover:bg-muted/30 transition-colors text-sm"
        >
          Close
        </button>
      </div>
    </div>
  )
}
