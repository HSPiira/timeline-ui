import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useStore } from '@tanstack/react-store'
import { authStore, authActions } from '../lib/auth-store'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const authState = useStore(authStore)
  const [tenantCode, setTenantCode] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    authActions.clearError()

    try {
      await authActions.login(username, password, tenantCode)
      navigate({ to: '/' })
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  // Redirect if already logged in
  if (authState.user) {
    navigate({ to: '/' })
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src="/logo.svg" alt="Timeline" className="w-16 h-16" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center mb-6 text-slate-900 dark:text-slate-100">
            Sign In
          </h1>

          {/* Error Message */}
          {authState.error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                {authState.error}
              </p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="tenant-code"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Tenant Code
              </label>
              <input
                id="tenant-code"
                type="text"
                value={tenantCode}
                onChange={(e) => setTenantCode(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                placeholder="e.g. acme-corp"
              />
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                placeholder="username"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={authState.isLoading}
              className="w-full px-4 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {authState.isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Don't have an account?{' '}
              <a
                href="/register"
                className="text-slate-900 dark:text-slate-100 font-semibold hover:underline"
              >
                Create one
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
