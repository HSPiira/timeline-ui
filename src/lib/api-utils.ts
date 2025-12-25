function hasMessage(error: unknown): error is { message: string } {
  return typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string'
}

function hasDetail(error: unknown): error is { detail: string } {
  return typeof error === 'object' && error !== null && 'detail' in error && typeof (error as any).detail === 'string'
}

/**
 * Extracts error message from API error responses in a type-safe way
 * @param error - The error object from API response
 * @param defaultMessage - Custom default message if error has no message/detail
 * @returns The extracted error message
 */
export function getApiErrorMessage(error: unknown, defaultMessage = 'An unexpected error occurred'): string {
    if (hasMessage(error)) {
      return error.message
    }
    if (hasDetail(error)) {
      return error.detail
    }
    return defaultMessage
  } 