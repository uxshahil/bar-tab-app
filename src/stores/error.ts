import type { CustomError, ExtendedPostgrestError } from '@/types/TypesError'
import type { PostgrestError } from '@supabase/supabase-js'

const activeError = ref<null | CustomError | ExtendedPostgrestError>(null)
const isCustomError = ref(false)

export const useErrorStore = defineStore('error-store', () => {
  const setError = ({
    error,
    customCode
  }: {
    error: string | PostgrestError | Error
    customCode?: number
  }) => {
    if (typeof error === 'string') isCustomError.value = true

    if (typeof error === 'string' || error instanceof Error) {
      activeError.value = typeof error === 'string' ? Error(error) : error
      activeError.value.customCode = customCode
      return
    }

    const extendedPostgrestError = error as ExtendedPostgrestError
    extendedPostgrestError.statusCode = customCode
    activeError.value = extendedPostgrestError
  }

  const clearError = () => {
    activeError.value = null
    isCustomError.value = false
  }

  return {
    activeError,
    setError,
    clearError,
    isCustomError
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useErrorStore, import.meta.hot))
}
