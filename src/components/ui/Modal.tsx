import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  maxWidth?: string
  zIndex?: number
  closeButton?: boolean
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'max-w-md',
  zIndex = 50,
  closeButton = true,
}: ModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
      style={{ zIndex }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`bg-background border border-border rounded-sm ${maxWidth} w-full max-h-[90vh] overflow-auto p-6 shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || closeButton) && (
          <div className="flex items-center justify-between mb-6">
            {title && <h2 className="text-xl font-semibold text-foreground">{title}</h2>}
            {closeButton && (
              <button
                onClick={onClose}
                className="text-muted-foreground/70 hover:text-foreground transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div>{children}</div>

        {/* Footer */}
        {footer && <div className="pt-4 border-t border-border mt-6">{footer}</div>}
      </div>
    </div>
  )
}

interface ModalActionsProps {
  children: ReactNode
}

export function ModalActions({ children }: ModalActionsProps) {
  return <div className="flex items-center gap-3">{children}</div>
}
