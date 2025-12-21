import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  Plus,
  Users,
  Calendar,
  Tag,
  X,
  Loader2,
  AlertCircle,
  Activity,
  ShoppingCart,
  FolderKanban,
  FileText,
  Package,
  Building2,
  User,
  LucideIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useStore } from '@tanstack/react-store'
import { timelineApi } from '@/lib/api-client'
import { authStore } from '@/lib/auth-store'
import type { SubjectResponse } from '@/lib/types'
import { getApiErrorMessage } from '@/lib/api-utils'

export const Route = createFileRoute('/subjects/')({
  component: SubjectsPage,
})

// Helper to get icon and color for subject type
function getSubjectIcon(
  subjectType: string
): { icon: LucideIcon; gradient: string } {
  const type = subjectType.toLowerCase()

  // Map subject types to icons and gradients
  const iconMap: Record<string, { icon: LucideIcon; gradient: string }> = {
    user: { icon: User, gradient: 'from-foreground/80 to-foreground/60' },
    users: { icon: Users, gradient: 'from-foreground/80 to-foreground/60' },
    customer: { icon: Building2, gradient: 'from-foreground/70 to-foreground/50' },
    order: { icon: ShoppingCart, gradient: 'from-foreground/75 to-foreground/55' },
    project: { icon: FolderKanban, gradient: 'from-foreground/70 to-foreground/50' },
    invoice: { icon: FileText, gradient: 'from-foreground/75 to-foreground/55' },
    shipment: { icon: Package, gradient: 'from-foreground/80 to-foreground/60' },
    package: { icon: Package, gradient: 'from-foreground/80 to-foreground/60' },
  }

  // Return specific icon or default
  return iconMap[type] || { icon: Tag, gradient: 'from-foreground/70 to-foreground/50' }
}

function SubjectsPage() {
  const navigate = useNavigate()
  const authState = useStore(authStore)
  const [subjects, setSubjects] = useState<SubjectResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filterType, setFilterType] = useState<string>('')
  const [subjectTypes, setSubjectTypes] = useState<string[]>([])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authState.isLoading && !authState.user) {
      navigate({ to: '/login' })
    }
  }, [authState.isLoading, authState.user, navigate])

  useEffect(() => {
    if (authState.user) {
      fetchSubjects()
    }
  }, [filterType, authState.user])

  const fetchSubjects = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = filterType ? { subject_type: filterType } : undefined
      const { data, error: apiError } = await timelineApi.subjects.list(params)

      if (apiError) {
        const errorMessage = getApiErrorMessage(apiError)
        setError(errorMessage)
      } else if (data) {
        setSubjects(data)

        // Extract unique subject types for filter
        const types = [...new Set(data.map((s: SubjectResponse) => s.subject_type))]
        setSubjectTypes(types)
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSubject = async (subjectType: string, externalRef?: string) => {
    try {
      const { data, error: apiError } = await timelineApi.subjects.create({
        subject_type: subjectType,
        external_ref: externalRef || undefined,
      })

      if (apiError) {
        console.error('Failed to create subject:', apiError)
        return false
      }

      if (data) {
        await fetchSubjects()
        setShowCreateModal(false)
        return true
      }
    } catch (err) {
      console.error('Error creating subject:', err)
      return false
    }
    return false
  }

  const handleSubjectClick = (subjectId: string) => {
    navigate({ to: `/events/subject/${subjectId}` })
  }

  const createDummySubjects = async () => {
    const dummyData = [
      { subject_type: 'user', external_ref: 'user_john_doe_001' },
      { subject_type: 'user', external_ref: 'user_jane_smith_002' },
      { subject_type: 'user', external_ref: 'user_bob_johnson_003' },
      { subject_type: 'order', external_ref: 'ORD-2024-001' },
      { subject_type: 'order', external_ref: 'ORD-2024-002' },
      { subject_type: 'order', external_ref: 'ORD-2024-003' },
      { subject_type: 'project', external_ref: 'PROJ-ALPHA' },
      { subject_type: 'project', external_ref: 'PROJ-BETA' },
      { subject_type: 'invoice', external_ref: 'INV-2024-001' },
      { subject_type: 'shipment', external_ref: 'SHIP-FDX-001' },
    ]

    console.log('Creating dummy subjects...')
    let created = 0

    for (const data of dummyData) {
      try {
        await timelineApi.subjects.create(data)
        created++
      } catch (error) {
        console.error(`Failed to create ${data.subject_type}:`, error)
      }
    }

    console.log(`Created ${created}/${dummyData.length} subjects`)
    await fetchSubjects()
  }

  // Expose function to window for easy access
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    ;(window as any).createDummySubjects = createDummySubjects
  }

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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading subjects...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 rounded-sm bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Unable to Load Subjects
          </h3>
          <p className="text-muted-foreground mb-6">
            {error}. Please check your connection and try again.
          </p>
          <button
            onClick={fetchSubjects}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Loader2 className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    )
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

        {/* Filter Controls */}
        {subjectTypes.length > 0 && (
          <div className="mb-4 flex items-center gap-4">
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
          </div>
        )}

        {/* Empty State or Subjects List */}
        {subjects.length === 0 ? (
          <div className="bg-card/80 backdrop-blur-sm rounded-sm p-8 border border-border/50 text-center">
            <div className="w-14 h-14 rounded-sm bg-secondary flex items-center justify-center mx-auto mb-3">
              <Users className="w-7 h-7 text-muted-foreground/70" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-2">
              No subjects yet
            </h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
              Create your first subject to start tracking events. Subjects represent entities with timelines like users, orders, or projects.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Your First Subject
              </button>
              
              {import.meta.env.DEV && 
              <button
                onClick={createDummySubjects}
                className="inline-flex items-center gap-2 px-4 py-2 border border-input text-foreground/90 rounded-sm font-medium hover:bg-muted/30 transition-colors"
                title="Create 10 test subjects"
              >
                <Users className="w-4 h-4" />
                Add Demo Data
              </button>}
            </div>
          </div>
        ) : (
          <div className="bg-card/80 backdrop-blur-sm rounded-sm border border-border/50 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-2 bg-muted/50 border-b">
              <div className="col-span-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Subject
              </div>
              <div className="col-span-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Type
              </div>
              <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Events
              </div>
              <div className="col-span-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Created
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-border">
              {subjects.map((subject) => {
                const { icon: Icon, gradient } = getSubjectIcon(subject.subject_type)
                return (
                  <button
                    key={subject.id}
                    onClick={() => handleSubjectClick(subject.id)}
                    className="grid grid-cols-12 gap-4 px-6 py-2.5 w-full text-left hover:bg-muted/30/50 transition-colors"
                  >
                    <div className="col-span-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-sm bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {subject.id}
                          </p>
                          {subject.external_ref && (
                            <p className="text-sm text-muted-foreground truncate">
                              {subject.external_ref}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  <div className="col-span-3 flex items-center">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-muted-foreground/70" />
                      <span className="text-sm font-medium text-foreground/90">
                        {subject.subject_type}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground/70" />
                      <span className="text-sm text-muted-foreground">
                        -
                      </span>
                    </div>
                  </div>
                  <div className="col-span-3 flex items-center">
                    <span className="text-sm text-muted-foreground">
                      {new Date(subject.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </button>
                )
              })}
            </div>
          </div>
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
