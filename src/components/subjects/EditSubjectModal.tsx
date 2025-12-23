import { useState } from 'react'
import { Loader2, AlertCircle, X } from 'lucide-react'

interface EditSubjectModalProps {
  isOpen: boolean
  onClose: () => void
  subject: {
    id: string
    subject_type: string
    external_ref?: string | null
  }
  onUpdate: (subjectId: string, externalRef?: string) => Promise<boolean>
}

export function EditSubjectModal({
  isOpen,
  onClose,
  subject,
  onUpdate,
}: EditSubjectModalProps) {
  const [externalRef, setExternalRef] = useState(subject.external_ref || '')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    setLoading(true)
    const success = await onUpdate(subject.id, externalRef || undefined)
    setLoading(false)

    if (success) {
      setExternalRef('')
      onClose()
    } else {
      setError('Failed to update subject. Please try again.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-sm max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Edit Subject
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground/70 hover:text-foreground transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Subject Type (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-foreground/90 mb-2">
                Subject Type
              </label>
              <div className="px-3 py-2 bg-muted rounded-sm text-foreground text-sm">
                {subject.subject_type}
              </div>
            </div>

            {/* External Reference */}
            <div>
              <label className="block text-sm font-medium text-foreground/90 mb-2">
                External Reference
              </label>
              <input
                type="text"
                value={externalRef}
                onChange={(e) => setExternalRef(e.target.value)}
                placeholder="e.g., external ID or reference"
                className="w-full px-3 py-2 bg-background border border-input rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Leave blank to remove the external reference
              </p>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Subject'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-input text-foreground/90 rounded-sm font-medium hover:bg-muted/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
