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
    user: { icon: User, gradient: 'from-blue-500 to-blue-600' },
    users: { icon: Users, gradient: 'from-blue-500 to-blue-600' },
    customer: { icon: Building2, gradient: 'from-indigo-500 to-indigo-600' },
    order: { icon: ShoppingCart, gradient: 'from-emerald-500 to-emerald-600' },
    project: { icon: FolderKanban, gradient: 'from-purple-500 to-purple-600' },
    invoice: { icon: FileText, gradient: 'from-amber-500 to-amber-600' },
    shipment: { icon: Package, gradient: 'from-orange-500 to-orange-600' },
    package: { icon: Package, gradient: 'from-orange-500 to-orange-600' },
  }

  // Return specific icon or default
  return iconMap[type] || { icon: Tag, gradient: 'from-slate-500 to-slate-600' }
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
        // @ts-ignore - openapi-fetch error handling
        const errorMessage = apiError?.message || 'Unable to connect to the server'
        setError(errorMessage)
        console.error('API error:', apiError)
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
  if (typeof window !== 'undefined') {
    ;(window as any).createDummySubjects = createDummySubjects
  }

  if (authState.isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
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
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading subjects...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 rounded-sm bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Unable to Load Subjects
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {error}. Please check your connection and try again.
          </p>
          <button
            onClick={fetchSubjects}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
          >
            <Loader2 className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent mb-1">
              Subjects
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Manage entities and their event timelines
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Subject
          </button>
        </div>

        {/* Filter Controls */}
        {subjectTypes.length > 0 && (
          <div className="mb-4 flex items-center gap-4">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Filter by type:
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-sm text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              >
                Clear filter
              </button>
            )}
          </div>
        )}

        {/* Empty State or Subjects List */}
        {subjects.length === 0 ? (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-sm p-8 border border-slate-200/50 dark:border-slate-700/50 text-center">
            <div className="w-14 h-14 rounded-sm bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
              <Users className="w-7 h-7 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No subjects yet
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-5 max-w-md mx-auto">
              Create your first subject to start tracking events. Subjects represent entities with timelines like users, orders, or projects.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Your First Subject
              </button>
              <button
                onClick={createDummySubjects}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                title="Create 10 test subjects"
              >
                <Users className="w-4 h-4" />
                Add Demo Data
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-sm border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <div className="col-span-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Subject
              </div>
              <div className="col-span-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Type
              </div>
              <div className="col-span-2 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Events
              </div>
              <div className="col-span-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Created
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {subjects.map((subject) => {
                const { icon: Icon, gradient } = getSubjectIcon(subject.subject_type)
                return (
                  <button
                    key={subject.id}
                    onClick={() => handleSubjectClick(subject.id)}
                    className="grid grid-cols-12 gap-4 px-6 py-2.5 w-full text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="col-span-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-sm bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                            {subject.id}
                          </p>
                          {subject.external_ref && (
                            <p className="text-sm text-slate-500 dark:text-slate-500 truncate">
                              {subject.external_ref}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  <div className="col-span-3 flex items-center">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {subject.subject_type}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        -
                      </span>
                    </div>
                  </div>
                  <div className="col-span-3 flex items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
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
      <div className="bg-white dark:bg-slate-800 rounded-sm max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Create Subject
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Subject Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={subjectType}
                onChange={(e) => setSubjectType(e.target.value)}
                placeholder="e.g., user, order, project"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Alphanumeric characters and underscores only
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                External Reference (Optional)
              </label>
              <input
                type="text"
                value={externalRef}
                onChange={(e) => setExternalRef(e.target.value)}
                placeholder="e.g., external ID or reference"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
