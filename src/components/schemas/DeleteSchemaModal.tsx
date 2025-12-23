import { useState } from 'react'
import { AlertTriangle, Loader2, X } from 'lucide-react'

interface DeleteConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  itemLabel: string
  details?: Record<string, string | number>
  warning?: string
  onConfirm: () => Promise<void>
  onClose: () => void
  isDestructive?: boolean
}

export function DeleteConfirmModal({
  isOpen,
  title,
  message,
  itemLabel,
  details,
  warning,
  onConfirm,
  onClose,
  isDestructive = true,
}: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setError(null)
    setLoading(true)

    try {
      await onConfirm()
      onClose()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-sm max-w-md w-full shadow-xl p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0 ${
              isDestructive
                ? 'bg-red-100 dark:bg-red-950/30'
                : 'bg-yellow-100 dark:bg-yellow-950/30'
            }`}>
              <AlertTriangle className={`w-5 h-5 ${
                isDestructive
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-yellow-600 dark:text-yellow-400'
              }`} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{message}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details */}
        {details && Object.keys(details).length > 0 && (
          <div className="mb-4 p-3 bg-muted/50 rounded-sm border border-border/50">
            <div className="space-y-2">
              {Object.entries(details).map(([key, value]) => (
                <div key={key}>
                  <p className="text-xs text-muted-foreground capitalize">{key}</p>
                  <p className="text-sm font-medium text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warning Message */}
        {warning && (
          <div className={`mb-4 p-3 rounded-sm border ${
            isDestructive
              ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
              : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
          }`}>
            <p className={`text-xs ${
              isDestructive
                ? 'text-red-900 dark:text-red-200'
                : 'text-yellow-900 dark:text-yellow-200'
            }`}>
              {warning}
            </p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-sm">
            <p className="text-xs text-red-900 dark:text-red-200 font-medium">Error</p>
            <p className="text-xs text-red-800 dark:text-red-300 mt-1">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-3 py-1.5 text-sm text-foreground hover:bg-muted rounded-sm font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 px-3 py-1.5 text-sm text-white rounded-sm font-medium transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2 ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Confirming...</span>
              </>
            ) : (
              `Confirm ${itemLabel}`
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Export with schema-specific name for backward compatibility
export { DeleteConfirmModal as DeleteSchemaModal }
