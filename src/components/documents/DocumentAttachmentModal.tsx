import { X, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { DocumentUpload } from './DocumentUpload'
import { DocumentList } from './DocumentList'

interface DocumentAttachmentModalProps {
  isOpen: boolean
  onClose: () => void
  eventId: string
  subjectId?: string
  eventType: string
}

type Tab = 'upload' | 'attached'

export function DocumentAttachmentModal({
  isOpen,
  onClose,
  eventId,
  subjectId,
  eventType,
}: DocumentAttachmentModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('upload')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  if (!isOpen) return null

  const handleUploadComplete = () => {
    setUploadError(null)
    // Refresh the document list
    setRefreshKey((prev) => prev + 1)
    // Optionally switch to viewing attached documents
    setActiveTab('attached')
  }

  const handleUploadError = (error: string) => {
    setUploadError(error)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-sm max-w-2xl w-full max-h-[90vh] overflow-auto p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Attach Documents
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Event: {eventType} {eventId.slice(0, 8)}...
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground/70 hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 border-b border-border">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 ${
              activeTab === 'upload'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Upload Documents
          </button>
          <button
            onClick={() => setActiveTab('attached')}
            className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 ${
              activeTab === 'attached'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Attached Documents
          </button>
        </div>

        {/* Error Alert */}
        {uploadError && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">
              {typeof uploadError === 'string' ? uploadError : JSON.stringify(uploadError)}
            </p>
          </div>
        )}

        {/* Content */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <DocumentUpload
              subjectId={subjectId}
              eventId={eventId}
              onUploadComplete={handleUploadComplete}
              onError={handleUploadError}
            />
          </div>
        )}

        {activeTab === 'attached' && (
          <div>
            <DocumentList
              key={refreshKey}
              eventId={eventId}
              subjectId={subjectId}
            />
          </div>
        )}

        {/* Close Button */}
        <div className="mt-6 pt-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-muted text-foreground rounded-sm font-medium hover:bg-muted/80 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
