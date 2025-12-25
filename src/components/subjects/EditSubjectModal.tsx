import { useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { FormField, FormInput, FormError } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'

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
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    setLoading(true)
    const success = await onUpdate(subject.id, externalRef || undefined)
    setLoading(false)

    if (success) {
      setExternalRef('')
      onClose()
      toast.success('Subject updated', 'Your changes have been saved')
    } else {
      const errorMsg = 'Failed to update subject. Please try again.'
      setError(errorMsg)
      toast.error('Update failed', errorMsg)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-background border border-border rounded-lg max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Edit Subject
          </h2>
          <button
            onClick={onClose}
            className="relative -mr-2 -mt-2 p-2 text-muted-foreground/70 hover:text-foreground hover:bg-muted/30 rounded-lg transition-colors"
            disabled={loading}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {error && <FormError message={error} />}

            {/* Subject Type (Read-only) */}
            <FormField label="Subject Type">
              <div className="px-3 py-2 bg-muted rounded-sm text-foreground text-sm">
                {subject.subject_type}
              </div>
            </FormField>

            {/* External Reference */}
            <FormField
              label="External Reference"
              hint="Leave blank to remove the external reference"
            >
              <FormInput
                type="text"
                value={externalRef}
                onChange={(e) => setExternalRef(e.target.value)}
                placeholder="e.g., external ID or reference"
                disabled={loading}
              />
            </FormField>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Subject'
              )}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
