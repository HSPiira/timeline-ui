import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { timelineApi } from '@/lib/api-client'
import {
  Loader2,
  Shield,
  ChevronDown,
  ChevronRight,
  CheckCircle,
} from 'lucide-react'
import { FormError } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import type { components } from '@/lib/timeline-api'

export const Route = createFileRoute('/settings/users/')({
  component: UsersPage,
})

type RoleResponse = components['schemas']['RoleResponse']

function UsersPage() {
  const authState = useRequireAuth()
  const [tenantUsers, setTenantUsers] = useState<Array<{ id: string; username: string; email?: string }>>([])
  const [roles, setRoles] = useState<RoleResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasNoAccess, setHasNoAccess] = useState(false)

  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [userRoles, setUserRoles] = useState<Record<string, RoleResponse[]>>({})
  const [selectedRoles, setSelectedRoles] = useState<Record<string, Set<string>>>({})
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [savingUserId, setSavingUserId] = useState<string | null>(null)

  useEffect(() => {
    if (authState.user) {
      fetchData()
    }
  }, [authState.user])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    setHasNoAccess(false)

    try {
      // Fetch roles
      const { data: rolesData, error: rolesError } = await timelineApi.roles.list({
        skip: 0,
        limit: 100,
      })

      if (rolesError) {
        const errorStr = JSON.stringify(rolesError).toLowerCase()
        const isNoAccess =
          errorStr.includes('permission') ||
          errorStr.includes('401') ||
          errorStr.includes('403')
        setHasNoAccess(isNoAccess)
        const errorMsg =
          // @ts-expect-error
          rolesError?.message || 'Unable to load roles'
        setError(errorMsg)
      } else if (rolesData) {
        setRoles(rolesData)
      }

      // For now, we'll mock tenant users since the API doesn't have a list endpoint
      // In a real scenario, you'd call: await timelineApi.users.list()
      // For demo, we'll show the current user as a placeholder
      setTenantUsers([
        {
          id: authState.user?.id || 'current-user',
          username: authState.user?.username || 'Current User',
          email: authState.user?.email || '',
        },
      ])
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleUserExpanded = async (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null)
    } else {
      setExpandedUser(userId)
      // Fetch user roles if not already loaded
      if (!userRoles[userId]) {
        try {
          const { data, error: apiError } = await timelineApi.users.getRoles(userId)
          if (!apiError && data) {
            setUserRoles((prev) => ({
              ...prev,
              [userId]: data,
            }))
            setSelectedRoles((prev) => ({
              ...prev,
              [userId]: new Set(data.map((r) => r.id)),
            }))
          }
        } catch (err) {
          console.error('Error fetching user roles:', err)
        }
      }
    }
  }

  const handleSaveRoles = async (userId: string) => {
    setSavingUserId(userId)
    setError(null)

    try {
      const currentRoleIds = userRoles[userId]?.map((r) => r.id) || []
      const newRoleIds = Array.from(selectedRoles[userId] || new Set())

      // Roles to assign
      const toAssign = newRoleIds.filter((id) => !currentRoleIds.includes(id))
      // Roles to remove
      const toRemove = currentRoleIds.filter((id) => !newRoleIds.includes(id))

      // Assign new roles
      for (const roleId of toAssign) {
        const { error: apiError } = await timelineApi.users.assignRole(userId, { role_id: roleId })
        if (apiError) {
          const errorMsg = // @ts-ignore
            apiError?.message || 'Failed to assign role'
          setError(errorMsg)
          setSavingUserId(null)
          return
        }
      }

      // Remove roles
      for (const roleId of toRemove) {
        const { error: apiError } = await timelineApi.users.removeRole(userId, roleId)
        if (apiError) {
          const errorMsg = // @ts-ignore
            apiError?.message || 'Failed to remove role'
          setError(errorMsg)
          setSavingUserId(null)
          return
        }
      }

      // Update local state
      const updatedUserRoles = roles.filter((r) => newRoleIds.includes(r.id))
      setUserRoles((prev) => ({
        ...prev,
        [userId]: updatedUserRoles,
      }))
      setEditingUserId(null)
    } finally {
      setSavingUserId(null)
    }
  }

  if (!authState.user) {
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading users...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Error Alert */}
      {error && <FormError message={error} />}

      {/* Limited Access Warning */}
      {hasNoAccess && (
        <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-700 rounded-lg flex gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900 dark:text-amber-100 text-sm">
              Limited Access
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-200 mt-0.5">
              You don't have permission to manage users. You can view but cannot modify.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-foreground mb-1">Users</h1>
        <p className="text-sm text-muted-foreground mb-3">Manage user roles and permissions</p>
      </div>

      {/* Users List */}
      {tenantUsers.length === 0 ? (
        <div className="text-center py-8 bg-card/80 rounded-lg border border-border/50 p-4">
          <h3 className="text-sm font-semibold text-foreground mb-1">No users found</h3>
          <p className="text-sm text-muted-foreground">No users in this tenant</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tenantUsers.map((user) => {
            const isExpanded = expandedUser === user.id
            const userRolesList = userRoles[user.id] || []
            const isEditing = editingUserId === user.id
            const isSaving = savingUserId === user.id
            const userSelectedRoles = selectedRoles[user.id] || new Set()

            return (
              <div
                key={user.id}
                className="bg-card/80 rounded-lg border border-border/50 overflow-hidden"
              >
                {/* User Header */}
                <button
                  onClick={() => toggleUserExpanded(user.id)}
                  disabled={hasNoAccess}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground">{user.username}</div>
                    {user.email && (
                      <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-xs px-1.5 py-0.5 bg-secondary text-muted-foreground rounded-sm font-mono">
                      {userRolesList.length} role{userRolesList.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </button>

                {/* User Roles Content */}
                {isExpanded && (
                  <div className="border-t border-border px-4 py-3 bg-muted/30">
                    {isEditing ? (
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-foreground mb-2">
                          Assign Roles to {user.username}
                        </h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {roles.map((role) => (
                            <label
                              key={role.id}
                              className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={userSelectedRoles.has(role.id)}
                                onChange={(e) => {
                                  const newSelected = new Set(userSelectedRoles)
                                  if (e.target.checked) {
                                    newSelected.add(role.id)
                                  } else {
                                    newSelected.delete(role.id)
                                  }
                                  setSelectedRoles((prev) => ({
                                    ...prev,
                                    [user.id]: newSelected,
                                  }))
                                }}
                                disabled={isSaving}
                                className="w-4 h-4 rounded border-input"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-foreground">
                                    {role.name}
                                  </span>
                                  {role.is_system && (
                                    <span className="text-xs px-1.5 py-0.5 bg-primary/20 text-primary rounded-sm font-medium">
                                      SYSTEM
                                    </span>
                                  )}
                                </div>
                                {role.description && (
                                  <p className="text-xs text-muted-foreground">
                                    {role.description}
                                  </p>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2 border-t border-border flex-col sm:flex-row">
                          <Button
                            onClick={() => {
                              setEditingUserId(null)
                              setSelectedRoles((prev) => ({
                                ...prev,
                                [user.id]: new Set(userRolesList.map((r) => r.id)),
                              }))
                            }}
                            disabled={isSaving}
                            variant="outline"
                            className="w-full sm:w-auto"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => handleSaveRoles(user.id)}
                            disabled={isSaving}
                            className="w-full sm:w-auto flex items-center justify-center gap-2"
                          >
                            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                            Save Roles
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {userRolesList.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No roles assigned</p>
                        ) : (
                          <div className="space-y-1">
                            {userRolesList.map((role) => (
                              <div
                                key={role.id}
                                className="flex items-center gap-2 p-2 bg-muted rounded"
                              >
                                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-foreground">
                                      {role.name}
                                    </span>
                                    {role.is_system && (
                                      <span className="text-xs px-1 py-0.5 bg-primary/20 text-primary rounded font-medium">
                                        SYSTEM
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {!hasNoAccess && (
                          <Button
                            onClick={() => {
                              setEditingUserId(user.id)
                              if (!selectedRoles[user.id]) {
                                setSelectedRoles((prev) => ({
                                  ...prev,
                                  [user.id]: new Set(userRolesList.map((r) => r.id)),
                                }))
                              }
                            }}
                            className="mt-3 w-full sm:w-auto flex items-center justify-center gap-2"
                          >
                            <Shield className="w-4 h-4" />
                            Edit Roles
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Note */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          Note: This shows tenant users. The user management panel integrates role-based access control
          directly, allowing administrators to assign or revoke roles instantly.
        </p>
      </div>
    </>
  )
}
