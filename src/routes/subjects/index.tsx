import { createFileRoute } from '@tanstack/react-router'
import {
  Plus,
  Users,
  X,
  Loader2,
  AlertCircle,
  Activity,
  Search,
  Grid3x3,
  Table2,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useStore } from '@tanstack/react-store'
import { useQueryClient } from '@tanstack/react-query'
import { timelineApi } from '@/lib/api-client'
import { authStore } from '@/lib/auth-store'
import { useSubjects } from '@/hooks/useSubjects'
import { useToast } from '@/hooks/useToast'
import { SubjectsTable } from '@/components/subjects/SubjectsTable'
import { SubjectsGrid } from '@/components/subjects/SubjectsGrid'
import { EditSubjectModal } from '@/components/subjects/EditSubjectModal'
import { EmptyState } from '@/components/ui/EmptyState'
import type { SubjectWithMetadata } from '@/hooks/useSubjects'

export const Route = createFileRoute('/subjects/')({
  component: SubjectsPage,
})

type ViewMode = 'grid' | 'table'

function SubjectsPage() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingSubject, setEditingSubject] = useState<SubjectWithMetadata | null>(null)
  const [filterType, setFilterType] = useState<string>('')
  const [search, setSearch] = useState('')
  const [allSubjectTypes, setAllSubjectTypes] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    // Initialize from localStorage on mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('subjects-view-mode')
      return (saved === 'table' ? 'table' : 'grid') as ViewMode
    }
    return 'grid'
  })

  // Get filtered subjects
  const { subjects, isLoading, isError, error } = useSubjects({
    filterType,
    search,
  })

  // Persist view mode to localStorage
  useEffect(() => {
    localStorage.setItem('subjects-view-mode', viewMode)
  }, [viewMode])

  // Track all available subject types (from initial load and subsequent data)
  useEffect(() => {
    const types = [...new Set(subjects.map((s) => s.subject_type))]
    // Merge with existing types to preserve them when filtering
    setAllSubjectTypes((prev) => {
      const merged = new Set([...prev, ...types])
      return Array.from(merged)
    })
  }, [subjects])

  const subjectTypes = allSubjectTypes

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
        toast.error('Failed to create', 'Unable to create subject')
        return false
      }

      // Invalidate the subjects query to automatically refetch the latest data
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      setShowCreateModal(false)
      toast.success('Subject created', `New subject "${subjectType}" created`)
      return true
    } catch (err) {
      console.error('Error creating subject:', err)
      toast.error('Error creating', 'An unexpected error occurred')
      return false
    }
  }

  const handleUpdateSubject = async (
    subjectId: string,
    externalRef?: string
  ) => {
    try {
      const { error: apiError } = await timelineApi.subjects.update(subjectId, {
        external_ref: externalRef || null,
      })

      if (apiError) {
        console.error('Failed to update subject:', apiError)
        return false
      }

      // Invalidate the subjects query to automatically refetch the latest data
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
      setShowEditModal(false)
      setEditingSubject(null)
      return true
    } catch (err) {
      console.error('Error updating subject:', err)
      return false
    }
  }

  const handleOpenEditModal = (subject: SubjectWithMetadata) => {
    setEditingSubject(subject)
    setShowEditModal(true)
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
    <>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              Subjects
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage entities and their event timelines
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-muted/50 rounded-xs p-1 border border-border/30">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Grid view"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'table'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Table view"
              >
                <Table2 className="w-4 h-4" />
              </button>
            </div>

            {/* Create Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xs font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Subject
            </button>
          </div>
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
              className="pl-10 pr-4 py-2 bg-background border border-input rounded-xs text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring w-64"
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
                className="px-3 py-2 bg-background border border-input rounded-xs text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
          <div className="min-h-75 bg-background flex items-center justify-center">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading subjects...</span>
            </div>
          </div>
        )}

        {isError && (
          <div className="min-h-75 bg-background flex items-center justify-center">
            <div className="text-center max-w-md px-4">
              <div className="w-16 h-16 rounded-xs bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
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
          <div className="bg-card/80 backdrop-blur-sm rounded-xs border border-border/50">
            <EmptyState
              icon={Users}
              title={search || filterType ? 'No subjects match' : 'No subjects yet'}
              description={
                search || filterType
                  ? 'Try adjusting your filters or search terms'
                  : 'Create your first subject to start tracking events and building verifiable event chains'
              }
              action={{
                label: 'Create Subject',
                onClick: () => setShowCreateModal(true),
              }}
              secondaryAction={
                search || filterType
                  ? {
                      label: 'Clear Filters',
                      onClick: () => {
                        setSearch('')
                        setFilterType('')
                      },
                    }
                  : undefined
              }
            />
          </div>
        )}

        {!isLoading && !isError && subjects.length > 0 && (
          viewMode === 'grid' ? <SubjectsGrid data={subjects} onEdit={handleOpenEditModal} /> : <SubjectsTable data={subjects} onEdit={handleOpenEditModal} />
        )}

        {/* Create Subject Modal */}
        {showCreateModal && (
          <CreateSubjectModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateSubject}
          />
        )}

        {/* Edit Subject Modal */}
        {showEditModal && editingSubject && (
          <EditSubjectModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false)
              setEditingSubject(null)
            }}
            subject={editingSubject}
            onUpdate={handleUpdateSubject}
          />
        )}
    </>
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
    const toast = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)

      // Validate subject type
      if (!subjectType.trim()) {
        const validationError = 'Subject type is required'
        setError(validationError)
        toast.error('Validation error', validationError)
        return
      }

      if (!/^[a-zA-Z0-9_]+$/.test(subjectType)) {
        const validationError = 'Subject type must contain only alphanumeric characters and underscores'
        setError(validationError)
        toast.error('Validation error', validationError)
        return
      }

      setLoading(true)
      const success = await onCreate(subjectType.toLowerCase(), externalRef || undefined)
      setLoading(false)

      if (!success) {
        const createError = 'Failed to create subject. Please try again.'
        setError(createError)
      }
    }
  
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-background border border-border rounded-xs max-w-md w-full p-6 shadow-xl">
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
                  className="w-full px-3 py-2 bg-background border border-input rounded-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
                  className="w-full px-3 py-2 bg-background border border-input rounded-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={loading}
                />
              </div>
  
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
            </div>
  
            <div className="flex items-center gap-3 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="px-4 py-2 border border-input text-foreground/90 rounded-xs font-medium hover:bg-muted/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }