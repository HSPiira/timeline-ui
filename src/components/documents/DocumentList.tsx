import { useEffect, useState } from 'react'
import { Download, Trash2, Loader2, AlertCircle, FileIcon } from 'lucide-react'
import { timelineApi } from '@/lib/api-client'
import type { components } from '@/lib/timeline-api'

export interface DocumentListProps {
  subjectId?: string
  eventId?: string
  readOnly?: boolean
  onDelete?: (documentId: string) => void
  onError?: (error: string) => void
}

type Document = components['schemas']['DocumentResponse']

const FILE_ICONS: Record<string, string> = {
  'application/pdf': '📄',
  'image/jpeg': '🖼️',
  'image/png': '🖼️',
  'image/gif': '🖼️',
  'image/webp': '🖼️',
  'text/plain': '📝',
  'application/msword': '📘',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📘',
  'application/vnd.ms-excel': '📊',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
}

function getMimeType(doc: Document): string {
  return doc.mime_type || 'application/octet-stream'
}

function getDisplayName(doc: Document): string {
  return doc.original_filename || doc.filename
}

function getFileSize(doc: Document): number {
  return doc.file_size || 0
}

export function DocumentList({ subjectId, eventId, readOnly, onDelete, onError }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchDocuments = async () => {
    setLoading(true)
    setError(null)
    try {
      let response

      if (subjectId) {
        response = await timelineApi.documents.listBySubject(subjectId)
      } else if (eventId) {
        response = await timelineApi.documents.listByEvent(eventId)
      } else {
        return
      }

      if (response.data) {
        setDocuments(response.data)
      } else if (response.error) {
        const errorMsg = typeof response.error === 'object' && 'message' in response.error ? (response.error as any).message : 'Failed to load documents'
        setError(errorMsg)
        onError?.(errorMsg)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unexpected error loading documents'
      setError(errorMsg)
      onError?.(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (subjectId || eventId) {
      fetchDocuments()
    }
  }, [subjectId, eventId])

  const handleDelete = async (documentId: string) => {
    if (!confirm('Delete this document?')) return

    setDeleting(documentId)
    try {
      const { error: deleteError } = await timelineApi.documents.delete(documentId)

      if (deleteError) {
        const errorMsg = typeof deleteError === 'object' && 'message' in deleteError ? (deleteError as any).message : 'Failed to delete document'
        setError(errorMsg)
        onError?.(errorMsg)
      } else {
        setDocuments((prev) => prev.filter((doc) => doc.id !== documentId))
        onDelete?.(documentId)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unexpected error deleting document'
      setError(errorMsg)
      onError?.(errorMsg)
    } finally {
      setDeleting(null)
    }
  }

  const handleDownload = async (documentId: string, filename: string) => {
    try {
      const { data, error: downloadError } = await timelineApi.documents.download(documentId)

      if (downloadError) {
        const errorMsg = typeof downloadError === 'object' && 'message' in downloadError ? (downloadError as any).message : 'Failed to download document'
        setError(errorMsg)
        onError?.(errorMsg)
        return
      }

      if (data) {
        const url = window.URL.createObjectURL(data as Blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to download'
      setError(errorMsg)
      onError?.(errorMsg)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading documents...</span>
        </div>
      </div>
    )
  }

  if (error && documents.length === 0) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-sm flex gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900 dark:text-red-200 text-sm">Error loading documents</h3>
          <p className="text-xs text-red-800 dark:text-red-300">{error}</p>
        </div>
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <FileIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-sm text-muted-foreground">No documents yet</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-3 font-medium text-muted-foreground">Name</th>
            <th className="text-left py-3 px-3 font-medium text-muted-foreground">Size</th>
            <th className="text-left py-3 px-3 font-medium text-muted-foreground">Uploaded</th>
            <th className="text-right py-3 px-3 font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id} className="border-b border-border hover:bg-muted/50 transition-colors">
              <td className="py-3 px-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">{FILE_ICONS[getMimeType(doc)] || '📎'}</span>
                  <span className="truncate">{getDisplayName(doc)}</span>
                </div>
              </td>
              <td className="py-3 px-3 text-muted-foreground">{(getFileSize(doc) / 1024 / 1024).toFixed(2)}MB</td>
              <td className="py-3 px-3 text-muted-foreground">
                {new Date(doc.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td className="py-3 px-3">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleDownload(doc.id, getDisplayName(doc))}
                    className="p-2 hover:bg-muted rounded-sm transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4 text-muted-foreground" />
                  </button>
                  {!readOnly && (
                    <button
                      onClick={() => handleDelete(doc.id)}
                      disabled={deleting === doc.id}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-sm transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {deleting === doc.id ? (
                        <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-red-500" />
                      )}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
