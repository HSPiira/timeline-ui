import { useState, useRef, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { Settings, Layers, Zap, Database } from 'lucide-react'

export function SettingsMenu() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-accent rounded-sm transition-all"
        title="Configuration & Settings"
      >
        <Settings className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-sm shadow-lg z-50">
          <div className="p-2">
            {/* Administration */}
            <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">Administration</div>

            {/* Roles */}
            <Link
              to="/settings/roles"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-sm transition-colors"
            >
              <Database className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="font-medium">Roles</div>
                <div className="text-xs text-muted-foreground">Manage roles</div>
              </div>
            </Link>

            {/* Users */}
            <Link
              to="/settings/users"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-sm transition-colors"
            >
              <Zap className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="font-medium">Users</div>
                <div className="text-xs text-muted-foreground">Manage permissions</div>
              </div>
            </Link>

            {/* Divider */}
            <div className="my-2 border-t border-border" />

            {/* Configuration */}
            <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">Configuration</div>

            {/* Schemas */}
            <Link
              to="/schemas"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-sm transition-colors"
            >
              <Database className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="font-medium">Event Schemas</div>
                <div className="text-xs text-muted-foreground">Manage JSON schemas</div>
              </div>
            </Link>

            {/* Workflows */}
            <Link
              to="/workflows"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-sm transition-colors"
            >
              <Zap className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="font-medium">Workflows</div>
                <div className="text-xs text-muted-foreground">Automation & triggers</div>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
