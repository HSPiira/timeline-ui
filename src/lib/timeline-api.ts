// Generated OpenAPI types
// Run `npm run generate:api` to regenerate from backend

export interface paths {
  '/auth/token': {
    post: {
      requestBody: {
        content: {
          'application/x-www-form-urlencoded': {
            username: string
            password: string
          }
        }
      }
      responses: {
        200: {
          content: {
            'application/json': {
              access_token: string
              token_type: string
            }
          }
        }
      }
    }
  }
  '/users/register': {
    post: {
      requestBody: {
        content: {
          'application/json': {
            username: string
            email: string
            password: string
            tenant_id: string
          }
        }
      }
      responses: {
        200: {
          content: {
            'application/json': User
          }
        }
      }
    }
  }
  '/users/me': {
    get: {
      responses: {
        200: {
          content: {
            'application/json': User
          }
        }
      }
    }
  }
  // Add more paths as needed - this is a minimal type definition
  // Run npm run generate:api to get full types from backend
  [key: string]: any
}

export interface User {
  id: string
  tenant_id: string
  username: string
  email: string
  is_active: boolean
  created_at: string
}
