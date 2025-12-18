import { Store } from '@tanstack/store'
import { timelineApi, setAuthToken, getAuthToken } from './api-client'
import type { User } from './timeline-api'

// Auth state interface
interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: getAuthToken(),
  isLoading: false,
  error: null,
}

// Create auth store
export const authStore = new Store(initialState)

// Auth actions
export const authActions = {
  async login(username: string, password: string, tenant_code: string) {
    authStore.setState((state) => ({ ...state, isLoading: true, error: null }))

    try {
      const response = await timelineApi.auth.login(username, password, tenant_code)

      if (response.error) {
        throw new Error('Invalid credentials')
      }

      const { access_token } = response.data
      setAuthToken(access_token)

      // Fetch user info
      const userResponse = await timelineApi.users.me()

      if (userResponse.error) {
        throw new Error('Failed to fetch user info')
      }

      authStore.setState({
        user: userResponse.data,
        token: access_token,
        isLoading: false,
        error: null,
      })

      return userResponse.data
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed'
      authStore.setState((state) => ({
        ...state,
        isLoading: false,
        error: errorMessage,
      }))
      throw error
    }
  },

  async register(data: {
    username: string
    email: string
    password: string
    tenant_code: string
  }) {
    authStore.setState((state) => ({ ...state, isLoading: true, error: null }))

    try {
      const response = await timelineApi.auth.register(data)

      if (response.error) {
        throw new Error('Registration failed')
      }

      authStore.setState((state) => ({ ...state, isLoading: false }))
      return response.data
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Registration failed'
      authStore.setState((state) => ({
        ...state,
        isLoading: false,
        error: errorMessage,
      }))
      throw error
    }
  },

  async logout() {
    setAuthToken(null)
    authStore.setState({
      user: null,
      token: null,
      isLoading: false,
      error: null,
    })
  },

  async initAuth() {
    const token = getAuthToken()

    if (!token) {
      return
    }

    authStore.setState((state) => ({ ...state, isLoading: true }))

    try {
      const response = await timelineApi.users.me()

      if (response.error) {
        // Token invalid, clear it
        setAuthToken(null)
        authStore.setState({
          user: null,
          token: null,
          isLoading: false,
          error: null,
        })
        return
      }

      authStore.setState({
        user: response.data,
        token,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      setAuthToken(null)
      authStore.setState({
        user: null,
        token: null,
        isLoading: false,
        error: null,
      })
    }
  },

  clearError() {
    authStore.setState((state) => ({ ...state, error: null }))
  },
}
