import { useCallback, useEffect, useState } from 'react'
import { Download, Trash2, Loader2, AlertCircle, FileIcon, Eye } from 'lucide-react'
import { timelineApi } from '@/lib/api-client'
import { DocumentViewer } from './DocumentViewer'
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
  const [viewingDocument, setViewingDocument] = useState<{ id: string; filename: string; type: string } | null>(null)

  const fetchDocuments = useCallback(async () => {
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

      if (response.error) {
        console.error('Document fetch error:', response.error)
        const errorMsg = typeof response.error === 'object' && 'message' in response.error ? (response.error as any).message : 'Failed to load documents'
        setError(errorMsg)
        onError?.(errorMsg)
      } else if (response.data && Array.isArray(response.data)) {
        console.log(`Loaded ${response.data.length} documents`)
        setDocuments(response.data)
      } else {
        console.log('No documents returned from API:', response.data)
        setDocuments([])
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unexpected error loading documents'
      setError(errorMsg)
      onError?.(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [subjectId, eventId, onError])

  useEffect(() => {
    if (subjectId || eventId) {
      fetchDocuments()
    }
  }, [subjectId, eventId, fetchDocuments])

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

  const handleView = (doc: Document) => {
    const mimeType = getMimeType(doc)
    const filename = getDisplayName(doc)
    setViewingDocument({
      id: doc.id,
      filename,
      type: mimeType,
    })
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
        <FileIcon className="w-12 h-12 mx-auto text-amber-200 dark:text-amber-900/40 mb-3" />
        <p className="text-sm text-amber-700 dark:text-amber-300">No documents yet</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-amber-200 dark:border-amber-800 rounded-sm overflow-hidden">
        <thead className="bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20">
          <tr className="border-b border-amber-200 dark:border-amber-800">
            <th className="text-left py-3 px-3 font-medium text-amber-900 dark:text-amber-200">Name</th>
            <th className="text-left py-3 px-3 font-medium text-amber-900 dark:text-amber-200">Size</th>
            <th className="text-left py-3 px-3 font-medium text-amber-900 dark:text-amber-200">Uploaded</th>
            <th className="text-right py-3 px-3 font-medium text-amber-900 dark:text-amber-200">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-amber-100 dark:divide-amber-900/30">
          {documents.map((doc) => (
            <tr key={doc.id} className="hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors">
              <td className="py-3 px-3">
                <button
                  onClick={() => handleView(doc)}
                  className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer group"
                  title="Click to view"
                >
                  <span className="text-base">{FILE_ICONS[getMimeType(doc)] || '📎'}</span>
                  <span className="truncate underline-offset-2 group-hover:underline font-medium text-foreground">{getDisplayName(doc)}</span>
                </button>
              </td>
              <td className="py-3 px-3 text-muted-foreground">  
                {getFileSize(doc) < 1024 * 1024  
                  ? `${(getFileSize(doc) / 1024).toFixed(1)}KB`  
                  : `${(getFileSize(doc) / 1024 / 1024).toFixed(2)}MB`}  
              </td>
              <td className="py-3 px-3 text-muted-foreground text-sm">
                {new Date(doc.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td className="py-3 px-3">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => handleView(doc)}
                    className="px-3 py-2 hover:bg-blue-100 dark:hover:bg-blue-950/30 rounded-sm transition-colors text-blue-600 dark:text-blue-400 font-medium"
                    title="View document"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownload(doc.id, getDisplayName(doc))}
                    className="px-3 py-2 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-sm transition-colors font-medium"
                    title="Download"
                  >
                    <Download className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </button>
                  {!readOnly && (
                    <button
                      onClick={() => handleDelete(doc.id)}
                      disabled={deleting === doc.id}
                      className="px-3 py-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-sm transition-colors disabled:opacity-50 font-medium"
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

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <DocumentViewer
          documentId={viewingDocument.id}
          filename={viewingDocument.filename}
          fileType={viewingDocument.type}
          onClose={() => setViewingDocument(null)}
        />
      )}
    </div>
  )
}
