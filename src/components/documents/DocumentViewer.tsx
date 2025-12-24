import { useEffect, useState } from 'react'
import { Download, Printer, AlertCircle, Loader2, File as FileIcon, X } from 'lucide-react'
import { timelineApi } from '@/lib/api-client'

export interface DocumentViewerProps {
  documentId: string
  filename: string
  fileType: string
  onClose: () => void
}

type ViewerState = 'loading' | 'ready' | 'error'

export function DocumentViewer({ documentId, filename, fileType, onClose }: DocumentViewerProps) {
  const [state, setState] = useState<ViewerState>('loading')
  const [error, setError] = useState<string | null>(null)
  const [content, setContent] = useState<Blob | null>(null)

  useEffect(() => {
    const loadDocument = async () => {
      setState('loading')
      setError(null)

      try {
        const { data, error: fetchError } = await timelineApi.documents.download(documentId)

        if (fetchError) {
          const errorMsg = typeof fetchError === 'object' && 'message' in fetchError ? (fetchError as { message: string }).message : 'Failed to load document'
          setError(errorMsg)
          setState('error')
          return
        }

        if (data instanceof Blob) {
          setContent(data)
          setState('ready')
        } else if (data) {
          setContent(new Blob([JSON.stringify(data)], { type: 'application/json' }))
          setState('ready')
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unexpected error loading document'
        setError(errorMsg)
        setState('error')
      }
    }

    loadDocument()
  }, [documentId])

  const isImage = fileType.startsWith('image/')
  const isPdf = fileType === 'application/pdf'
  const isPreviewable = isImage || isPdf

  const handleDownload = async () => {
    try {
      const { data, error: downloadError } = await timelineApi.documents.download(documentId)

      if (downloadError) {
        const errorMsg = typeof downloadError === 'object' && 'message' in downloadError ? (downloadError as { message: string }).message : 'Failed to download'
        setError(errorMsg)
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
    }
  }

  const handlePrint = () => {
    if (isImage && content instanceof Blob) {
      const url = URL.createObjectURL(content)
      const printWindow = window.open(url)
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print()
        })
      }
    }
  }

  // Note: DocumentViewer doesn't use the standard Modal since it needs custom header layout
  // We keep the direct DOM structure for better control over the flex layout
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose} role="presentation">
      <div
        className="bg-background border border-border rounded-sm shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-foreground truncate">{filename}</h2>
            <p className="text-xs text-muted-foreground">{fileType}</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isImage && (
              <button onClick={handlePrint} className="px-4 py-2 hover:bg-muted rounded-sm transition-colors font-medium" title="Print">
                <Printer className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            <button onClick={handleDownload} className="px-4 py-2 hover:bg-muted rounded-sm transition-colors font-medium" title="Download">
              <Download className="w-4 h-4 text-muted-foreground" />
            </button>
            <button onClick={onClose} className="px-4 py-2 hover:bg-muted rounded-sm transition-colors font-medium" title="Close" aria-label="Close modal">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto flex items-center justify-center bg-muted/20">
          {state === 'loading' && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading document...</span>
            </div>
          )}

          {state === 'error' && (
            <div className="flex flex-col items-center gap-3 text-center p-8">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <div>
                <h3 className="font-semibold text-foreground">Unable to load document</h3>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
                <button
                  onClick={handleDownload}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Download instead
                </button>
              </div>
            </div>
          )}

          {state === 'ready' && (
            <>
              {isImage && content instanceof Blob && (
                <img
                  src={URL.createObjectURL(content)}
                  alt={filename}
                  className="max-w-full max-h-full object-contain"
                />
              )}

              {isPdf && (
                <div className="flex flex-col items-center justify-center gap-4">
                  <FileIcon className="w-16 h-16 text-muted-foreground/50" />
                  <div className="text-center">
                    <p className="text-foreground font-medium">PDF Preview</p>
                    <p className="text-sm text-muted-foreground mt-1">PDF preview is not available in your browser</p>
                    <button
                      onClick={handleDownload}
                      className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
              )}

              {!isPreviewable && (
                <div className="flex flex-col items-center justify-center gap-4">
                  <FileIcon className="w-16 h-16 text-muted-foreground/50" />
                  <div className="text-center">
                    <p className="text-foreground font-medium">File Preview Unavailable</p>
                    <p className="text-sm text-muted-foreground mt-1">This file type cannot be previewed</p>
                    <button
                      onClick={handleDownload}
                      className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      Download File
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
