import createClient from 'openapi-fetch'
import type { paths, components } from './timeline-api'

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
      return client.POST('/auth/token', {
        body: {
          username,
          password,
          tenant_code,
        },
      })
    },
    register: (data: components['schemas']['UserCreate']) =>
      client.POST('/users/register', { body: data }),
  },

  // Users
  users: {
    me: () => client.GET('/users/me'),
  },

  // Tenants
  tenants: {
    list: () => client.GET('/tenants/'),
    get: (id: string) =>
      client.GET('/tenants/{tenant_id}', {
        params: { path: { tenant_id: id } },
      }),
    create: (data: components['schemas']['TenantCreate']) =>
      client.POST('/tenants/', { body: data }),
  },

  // Subjects
  subjects: {
    list: (params?: { skip?: number; limit?: number; subject_type?: string }) =>
      client.GET('/subjects/', {
        params: { query: params },
      }),
    get: (id: string) =>
      client.GET('/subjects/{subject_id}', {
        params: { path: { subject_id: id } },
      }),
    create: (data: components['schemas']['SubjectCreate']) =>
      client.POST('/subjects/', { body: data }),
    update: (id: string, data: components['schemas']['SubjectUpdate']) =>
      client.PUT('/subjects/{subject_id}', {
        params: { path: { subject_id: id } },
        body: data,
      }),
    delete: (id: string) =>
      client.DELETE('/subjects/{subject_id}', {
        params: { path: { subject_id: id } },
      }),
  },

  // Events
  events: {
    listAll: (params?: { event_type?: string; skip?: number; limit?: number }) =>
      client.GET('/events/', {
        params: { query: params },
      }),
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
    get: (id: string) =>
      client.GET('/events/{event_id}', {
        params: { path: { event_id: id } },
      }),
    create: (data: components['schemas']['EventCreate']) =>
      client.POST('/events/', { body: data }),
  },

  // Event Schemas
  eventSchemas: {
    list: () => client.GET('/event-schemas/'),
    getActive: (eventType: string) =>
      client.GET('/event-schemas/event-type/{event_type}/active', {
        params: { path: { event_type: eventType } },
      }),
    create: (data: components['schemas']['EventSchemaCreate']) =>
      client.POST('/event-schemas/', { body: data }),
  },

  // Documents
  documents: {
    listBySubject: (subjectId: string) =>
      client.GET('/documents/subject/{subject_id}', {
        params: { path: { subject_id: subjectId } },
      }),
    listByEvent: (eventId: string) =>
      client.GET('/documents/event/{event_id}', {
        params: { path: { event_id: eventId } },
      }),
    get: (id: string) =>
      client.GET('/documents/{document_id}', {
        params: { path: { document_id: id } },
      }),
  },

  // Workflows
  workflows: {
    list: () => client.GET('/workflows/'),
    create: (data: components['schemas']['WorkflowCreate']) =>
      client.POST('/workflows/', { body: data }),
  },

  // Email Accounts
  emailAccounts: {
    list: () => client.GET('/email-accounts/'),
    get: (id: string) =>
      client.GET('/email-accounts/{account_id}', {
        params: { path: { account_id: id } },
      }),
    create: (data: components['schemas']['EmailAccountCreate']) =>
      client.POST('/email-accounts/', { body: data }),
    sync: (id: string, incremental: boolean = true) =>
      client.POST('/email-accounts/{account_id}/sync', {
        params: { path: { account_id: id } },
        body: { incremental },
      }),
  },
}
