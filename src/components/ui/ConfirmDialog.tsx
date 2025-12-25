import { AlertCircle, X } from 'lucide-react'
import { Button } from './Button'

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-background border border-border rounded-lg max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
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
            className="relative -mr-2 p-2 text-muted-foreground/70 hover:text-foreground hover:bg-muted/30 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Close"
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
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            variant={isDestructive ? 'destructive' : 'primary'}
            className="flex-1"
          >
            {confirmText}
          </Button>
          <Button
            onClick={onCancel}
            disabled={isLoading}
            variant="outline"
            className="flex-1"
          >
            {cancelText}
          </Button>
        </div>
      </div>
    </div>
  )
}
