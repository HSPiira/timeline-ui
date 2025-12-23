function hasMessage(error: unknown): error is { message: string } {  
  return typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string'  
}

export function getApiErrorMessage(error: unknown): string {  
    if (hasMessage(error)) {  
      return error.message  
    }  
    return 'An unexpected error occurred'  
  } 