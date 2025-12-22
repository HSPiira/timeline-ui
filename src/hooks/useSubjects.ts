import { useQuery } from '@tanstack/react-query'
import { timelineApi } from '@/lib/api-client'
import { getApiErrorMessage } from '@/lib/api-utils'

interface UseSubjectsProps {
  filterType?: string
  search?: string
}

export function useSubjects({ filterType, search }: UseSubjectsProps = {}) {
  const queryKey = ['subjects', { filterType, search }]

  const { data, error, isLoading, isError } = useQuery({
    queryKey,
    queryFn: async () => {
      const params: any = {}
      if (filterType) {
        params.subject_type = filterType
      }
      if (search) {
        params.q = search
      }

      const { data, error: apiError } = await timelineApi.subjects.list(params)

      if (apiError) {
        throw new Error(getApiErrorMessage(apiError))
      }

      return data
    },
  })

  return {
    subjects: data ?? [],
    isLoading,
    isError,
    error: error as Error | null,
  }
}
