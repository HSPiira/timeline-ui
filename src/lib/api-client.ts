import createClient from 'openapi-fetch'
import type { paths } from './timeline-api'

// Create API client
const client = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Auth token management
let authToken: string | null = null

if (typeof window !== 'undefined') {
  authToken = localStorage.getItem('auth_token')
}

export function setAuthToken(token: string | null) {
  authToken = token
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('auth_token', token)
    } else {
      localStorage.removeItem('auth_token')
    }
  }
}

export function getAuthToken(): string | null {
  return authToken
}

// Add auth header interceptor
client.use({
  onRequest({ request }) {
    if (authToken) {
      request.headers.set('Authorization', `Bearer ${authToken}`)
    }
    return request
  },
})

// Type-safe Timeline API
export const timelineApi = {
  // Auth
  auth: {
    login: async (username: string, password: string, tenant_code: string) => {
      const formData = new URLSearchParams()
      formData.append('username', username)
      formData.append('password', password)
      formData.append('tenant_code', tenant_code)

      return client.POST('/auth/token', {
        body: formData as any,
        bodySerializer: () => formData.toString(),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
    },
    register: (data: {
      username: string
      email: string
      password: string
      tenant_id: string
    }) => client.POST('/users/register', { body: data }),
  },

  // Users
  users: {
    me: () => client.GET('/users/me'),
  },

  // Tenants
  tenants: {
    list: () => client.GET('/tenants/'),
    get: (id: string) => client.GET('/tenants/{id}', { params: { path: { id } } }),
    create: (data: { code: string; name: string }) =>
      client.POST('/tenants/', { body: data }),
  },

  // Subjects
  subjects: {
    list: () => client.GET('/subjects/'),
    get: (id: string) => client.GET('/subjects/{id}', { params: { path: { id } } }),
    create: (data: { subject_type: string; external_ref?: string }) =>
      client.POST('/subjects/', { body: data }),
  },

  // Events
  events: {
    list: (
      subjectId: string,
      params?: { event_type?: string; skip?: number; limit?: number }
    ) =>
      client.GET('/events/subject/{subject_id}', {
        params: {
          path: { subject_id: subjectId },
          query: params,
        },
      }),
    get: (id: string) => client.GET('/events/{id}', { params: { path: { id } } }),
    create: (data: {
      subject_id: string
      event_type: string
      event_time: string
      payload: any
    }) => client.POST('/events/', { body: data }),
  },

  // Event Schemas
  eventSchemas: {
    list: () => client.GET('/event-schemas/'),
    getActive: (eventType: string) =>
      client.GET('/event-schemas/event-type/{event_type}/active', {
        params: { path: { event_type: eventType } },
      }),
    create: (data: {
      event_type: string
      schema_json: any
      version: number
      is_active: boolean
    }) => client.POST('/event-schemas/', { body: data }),
  },

  // Documents
  documents: {
    list: (subjectId?: string) =>
      client.GET('/documents/', {
        params: { query: { subject_id: subjectId } },
      }),
    get: (id: string) => client.GET('/documents/{id}', { params: { path: { id } } }),
  },

  // Workflows
  workflows: {
    list: () => client.GET('/workflows/'),
    create: (data: {
      name: string
      trigger_event_type: string
      trigger_conditions?: any
      actions: any[]
    }) => client.POST('/workflows/', { body: data }),
  },

  // Email Accounts
  emailAccounts: {
    list: () => client.GET('/email-accounts/'),
    get: (id: string) =>
      client.GET('/email-accounts/{id}', { params: { path: { id } } }),
    create: (data: {
      provider_type: string
      email_address: string
      credentials: any
      connection_params?: any
    }) => client.POST('/email-accounts/', { body: data }),
    sync: (id: string, incremental: boolean = true) =>
      client.POST('/email-accounts/{id}/sync', {
        params: { path: { id } },
        body: { incremental },
      }),
  },
}
