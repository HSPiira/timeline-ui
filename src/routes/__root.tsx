import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  Link,
  useRouterState,
  useNavigate,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { useStore } from '@tanstack/react-store'
import { useEffect } from 'react'
import { LogOut, LayoutDashboard, Users, Calendar } from 'lucide-react'

import TanStackQueryDevtools from '@/integrations/tanstack-query/devtools'
import { authStore, authActions } from '@/lib/auth-store'
import { ThemeToggle } from '@/components/theme/theme-toggler'

import appCss from '@/styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Timeline',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/logo.svg',
      },
    ],
  }),

  shellComponent: RootDocument,
})

function NavLink({
  to,
  icon: Icon,
  children,
}: {
  to: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  const router = useRouterState()
  const pathname = router.location.pathname
  const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to)

  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-sm transition-all ${
        isActive
          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
          : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      <Icon className="w-4 h-4" />
      {children}
    </Link>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const authState = useStore(authStore)
  const navigate = useNavigate()

  // Initialize auth on mount
  useEffect(() => {
    authActions.initAuth()
  }, [])

  const handleLogout = () => {
    authActions.logout()
    navigate({ to: '/login' })
  }

  return (
    <html lang="en" className="h-full">
      <head>
        <HeadContent />
      </head>
      <body className="h-full overflow-x-hidden">
        {/* Header - only show on non-auth pages */}
        {authState.user && (
          <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-8">
                  <Link to="/" className="flex items-center gap-2 group">
                    <img src="/logo.svg" alt="Timeline" className="w-8 h-8 transition-transform group-hover:scale-110" />
                    <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                      Timeline
                    </span>
                  </Link>

                  <nav className="hidden md:flex gap-1">
                    <NavLink to="/" icon={LayoutDashboard}>
                      Dashboard
                    </NavLink>
                    <NavLink to="/subjects" icon={Users}>
                      Subjects
                    </NavLink>
                    <NavLink to="/events" icon={Calendar}>
                      Events
                    </NavLink>
                  </nav>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {authState.user.username}
                  </span>
                  <ThemeToggle variant="ghost" size="default" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </header>
        )}

        <main className={authState.user ? 'pt-16' : ''}>{children}</main>

        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
