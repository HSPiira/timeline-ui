import { createFileRoute } from '@tanstack/react-router'
import {
  Plus,
  Users,
  X,
  Loader2,
  AlertCircle,
  Activity,
  Search,
} from 'lucide-react'
import { useState } from 'react'
import { useStore } from '@tanstack/react-store'
import { timelineApi } from '@/lib/api-client'
import { authStore } from '@/lib/auth-store'
import { useSubjects } from '@/hooks/useSubjects'
import { SubjectsTable } from '@/components/subjects/SubjectsTable'

export const Route = createFileRoute('/subjects/')({
  component: SubjectsPage,
})

function SubjectsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filterType, setFilterType] = useState<string>('')
  const [search, setSearch] = useState('')
  const { subjects, isLoading, isError, error } = useSubjects({
    filterType,
    search,
  })

  const subjectTypes = [...new Set(subjects.map((s) => s.subject_type))]

  const handleCreateSubject = async (
    subjectType: string,
    externalRef?: string
  ) => {
    try {
      const { error: apiError } = await timelineApi.subjects.create({
        subject_type: subjectType,
        external_ref: externalRef || undefined,
      })

      if (apiError) {
        console.error('Failed to create subject:', apiError)
        return false
      }

      // Invalidate the query to refetch the subjects
      // This is handled automatically by react-query, but we can be explicit
      // by using queryClient.invalidateQueries(['subjects'])
      // For now, the hook will refetch on filterType or search change
      setShowCreateModal(false)
      return true
    } catch (err) {
      console.error('Error creating subject:', err)
      return false
    }
  }

  const authState = useStore(authStore)

  if (authState.isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Activity className="w-5 h-5 animate-pulse" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  if (!authState.user) {
    return null
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              Subjects
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage entities and their event timelines
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Subject
          </button>
        </div>

        {/* Filter and Search Controls */}
        <div className="mb-4 flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by ID or external ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-background border border-input rounded-sm text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring w-64"
            />
          </div>
          {subjectTypes.length > 0 && (
            <>
              <label className="text-sm font-medium text-foreground/90">
                Filter by type:
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-background border border-input rounded-sm text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All types</option>
                {subjectTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {filterType && (
                <button
                  onClick={() => setFilterType('')}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Clear filter
                </button>
              )}
            </>
          )}
        </div>

        {/* Content */}
        {isLoading && (
          <div className="min-h-[300px] bg-background flex items-center justify-center">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading subjects...</span>
            </div>
          </div>
        )}

        {isError && (
          <div className="min-h-[300px] bg-background flex items-center justify-center">
            <div className="text-center max-w-md px-4">
              <div className="w-16 h-16 rounded-sm bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Unable to Load Subjects
              </h3>
              <p className="text-muted-foreground mb-6">
                {error?.message || 'An unexpected error occurred'}. Please check
                your connection and try again.
              </p>
            </div>
          </div>
        )}

        {!isLoading && !isError && subjects.length === 0 && (
          <div className="bg-card/80 backdrop-blur-sm rounded-sm p-8 border border-border/50 text-center">
            <div className="w-14 h-14 rounded-sm bg-secondary flex items-center justify-center mx-auto mb-3">
              <Users className="w-7 h-7 text-muted-foreground/70" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-2">
              No subjects found
            </h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
              {search || filterType
                ? 'No subjects match your current filters.'
                : 'Create your first subject to start tracking events.'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Subject
            </button>
          </div>
        )}

        {!isLoading && !isError && subjects.length > 0 && (
          <SubjectsTable data={subjects} />
        )}

        {/* Create Subject Modal */}
        {showCreateModal && (
          <CreateSubjectModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateSubject}
          />
        )}
      </div>
    </div>
  )
}

function CreateSubjectModal({
    onClose,
    onCreate,
  }: {
    onClose: () => void
    onCreate: (subjectType: string, externalRef?: string) => Promise<boolean>
  }) {
    const [subjectType, setSubjectType] = useState('')
    const [externalRef, setExternalRef] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)
  
      // Validate subject type
      if (!subjectType.trim()) {
        setError('Subject type is required')
        return
      }
  
      if (!/^[a-zA-Z0-9_]+$/.test(subjectType)) {
        setError('Subject type must contain only alphanumeric characters and underscores')
        return
      }
  
      setLoading(true)
      const success = await onCreate(subjectType.toLowerCase(), externalRef || undefined)
      setLoading(false)
  
      if (!success) {
        setError('Failed to create subject. Please try again.')
      }
    }
  
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-card rounded-sm max-w-md w-full p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              Create Subject
            </h2>
            <button
              onClick={onClose}
              className="text-muted-foreground/70 hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
  
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/90 mb-2">
                  Subject Type <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={subjectType}
                  onChange={(e) => setSubjectType(e.target.value)}
                  placeholder="e.g., user, order, project"
                  className="w-full px-3 py-2 bg-background border border-input rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Alphanumeric characters and underscores only
                </p>
              </div>
  
              <div>
                <label className="block text-sm font-medium text-foreground/90 mb-2">
                  External Reference (Optional)
                </label>
                <input
                  type="text"
                  value={externalRef}
                  onChange={(e) => setExternalRef(e.target.value)}
                  placeholder="e.g., external ID or reference"
                  className="w-full px-3 py-2 bg-background border border-input rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={loading}
                />
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
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Subject
                  </>
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