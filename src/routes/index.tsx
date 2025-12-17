import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { useEffect } from 'react'
import { authStore } from '../lib/auth-store'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const navigate = useNavigate()
  const authState = useStore(authStore)

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authState.isLoading && !authState.user) {
      navigate({ to: '/login' })
    }
  }, [authState.isLoading, authState.user, navigate])

  // Show loading state while checking auth
  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (!authState.user) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Welcome back, {authState.user.username}!
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Timeline event sourcing system
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Subjects
              </h3>
              <span className="text-3xl">📋</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              --
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Events
              </h3>
              <span className="text-3xl">⚡</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              --
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Active Workflows
              </h3>
              <span className="text-3xl">🔄</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              --
            </p>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Getting Started
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-slate-400 dark:hover:border-slate-500 transition-colors cursor-pointer">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Create a Subject
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Start tracking events for a new entity
              </p>
            </div>

            <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-slate-400 dark:hover:border-slate-500 transition-colors cursor-pointer">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Record an Event
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Add immutable events to your timeline
              </p>
            </div>

            <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-slate-400 dark:hover:border-slate-500 transition-colors cursor-pointer">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Define Event Schema
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Configure validation rules for event types
              </p>
            </div>

            <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-slate-400 dark:hover:border-slate-500 transition-colors cursor-pointer">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Setup Workflow
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Automate actions when specific events occur
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
