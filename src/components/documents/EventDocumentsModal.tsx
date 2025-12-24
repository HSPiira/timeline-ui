import { useState } from 'react'
import { X, Plus, Loader2 } from 'lucide-react'
import { DocumentList } from './DocumentList'
import { EventDocumentUpload } from './EventDocumentUpload'
import { timelineApi } from '@/lib/api-client'
import type { components } from '@/lib/timeline-api'

export interface EventDocumentsModalProps {
  eventId: string
  subjectId: string
  eventType: string
  onClose: () => void
  onDocumentsUpdated?: () => void
}

export function EventDocumentsModal({
  eventId,
  subjectId,
  eventType,
  onClose,
  onDocumentsUpdated
}: EventDocumentsModalProps) {
  const [showUpload, setShowUpload] = useState(false)
  const [stagedFiles, setStagedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFilesChanged = (files: File[]) => {
    setStagedFiles(files)
    setError(null)
  }

  const handleUploadDocuments = async () => {
    if (stagedFiles.length === 0) return

    setUploading(true)
    setError(null)

    try {
      // Upload all documents
      const documentIds = await Promise.all(
        stagedFiles.map(async (file) => {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('subject_id', subjectId)
          formData.append('document_type', 'evidence')

          const { data, error } = await timelineApi.documents.upload(formData)
          if (error) {
            throw new Error(typeof error === 'object' && 'message' in error ? (error as any).message : 'Failed to upload document')
          }
          return (data as any).id
        })
      )

      // Create a new "document_update" event to maintain audit trail
      const eventCreateData: components['schemas']['EventCreate'] = {
        subject_id: subjectId,
        event_type: 'document_update',
        schema_version: 1,
        event_time: new Date().toISOString(),
        payload: {
          original_event_id: eventId,
          original_event_type: eventType,
          document_ids: documentIds,
          action: 'documents_added'
        },
      }

      const { error: createError } = await timelineApi.events.create(eventCreateData)

      if (createError) {
        const errorMessage =
          typeof createError === 'object' && 'message' in createError
            ? (createError as any).message
            : 'Failed to create document update event'
        setError(errorMessage)
        return
      }

      // Success - reset and notify
      setStagedFiles([])
      setShowUpload(false)
      onDocumentsUpdated?.()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMsg)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose} role="presentation">
      <div
        className="bg-background border border-border rounded-sm shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="font-semibold text-foreground">Event Documents</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{eventId.slice(0, 8)}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-sm transition-colors"
            title="Close"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* Error Alert */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-sm">
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Current Documents */}
          <div>
            <h3 className="text-sm font-medium mb-3">Current Documents</h3>
            <DocumentList eventId={eventId} readOnly={true} />
          </div>

          {/* Upload Section */}
          {showUpload && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-sm space-y-3">
              <div>
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">Add Additional Documents</h4>
                <p className="text-xs text-blue-800 dark:text-blue-300 mb-3">
                  A new "document_update" event will be created to maintain the audit trail. The original event and its documents remain unchanged.
                </p>
              </div>

              <EventDocumentUpload
                subjectId={subjectId}
                onFilesChanged={handleFilesChanged}
                onError={setError}
              />

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={handleUploadDocuments}
                  disabled={stagedFiles.length === 0 || uploading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3" />
                      Create Update Event
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowUpload(false)
                    setStagedFiles([])
                    setError(null)
                  }}
                  disabled={uploading}
                  className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Show Upload Button */}
          {!showUpload && (
            <button
              onClick={() => setShowUpload(true)}
              className="w-full px-3 py-2 text-sm border border-dashed border-primary text-primary rounded-sm hover:bg-primary/5 transition-colors font-medium"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Attach Additional Documents
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
