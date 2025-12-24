import { AlertCircle, X } from 'lucide-react'

export interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
  isLoading?: boolean
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-sm max-w-md w-full p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className={`flex-shrink-0 w-10 h-10 rounded-sm flex items-center justify-center ${
            isDestructive
              ? 'bg-destructive/10 text-destructive'
              : 'bg-amber-100/30 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
          }`}>
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-foreground">
              {title}
            </h2>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-muted-foreground/70 hover:text-foreground transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message */}
        <p className="text-sm text-muted-foreground mb-6">
          {message}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isDestructive
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {confirmText}
          </button>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-input text-foreground/90 rounded-sm font-medium hover:bg-muted/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  )
}
