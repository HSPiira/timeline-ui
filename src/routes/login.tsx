import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useStore } from '@tanstack/react-store'
import { authStore, authActions } from '@/lib/auth-store'
import { useRedirectIfAuthenticated } from '@/lib/hooks'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const authState = useStore(authStore)
  const [tenantCode, setTenantCode] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // Redirect if already logged in
  const isAuthenticated = useRedirectIfAuthenticated()

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

  // Show nothing while redirecting
  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="bg-card shadow-xl rounded-xs p-8 border">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src="/logo.svg" alt="Timeline" className="w-16 h-16" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center mb-6 text-foreground">
            Sign In
          </h1>

          {/* Error Message */}
          {authState.error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xs">
              <p className="text-sm text-destructive">
                {authState.error}
              </p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="tenant-code"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Tenant Code
              </label>
              <Input
                id="tenant-code"
                type="text"
                value={tenantCode}
                onChange={(e) => setTenantCode(e.target.value)}
                required
                placeholder="e.g. acme-corp"
              />
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="username"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={authState.isLoading}
              isLoading={authState.isLoading}
              className="w-full"
            >
              {authState.isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-foreground font-semibold hover:underline"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
