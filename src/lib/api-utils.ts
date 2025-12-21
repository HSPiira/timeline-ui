export function getApiErrorMessage(error: unknown): string {  
    if (error && typeof error === 'object' && 'message' in error) {  
      return (error as { message: string }).message  
    }  
    return 'An unexpected error occurred'  
  } 