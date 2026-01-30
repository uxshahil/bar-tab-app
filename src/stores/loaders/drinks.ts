import {
  drinksQuery,
  drinkQuery,
  drinksByCategoryQuery,
  updateDrinkQuery,
  deleteDrinkQuery,
  fetchDrinks as fetchDrinksQuery // Rename to avoid conflict if needed, or just use fetchDrinks
} from '@/services/supabase/queries/drinkQueries'
import drinkApi from '@/services/api/drinkApi'
import { useMemoize } from '@vueuse/core'
import type { Drink, Drinks } from '@/services/supabase/types/drinkTypes'
import { socket } from '@/services/socket/socket'

export const useDrinksStore = defineStore('drinks-store', () => {
  const drinks = ref<Drinks | null>(null)
  const categoryDrinks = ref<Drinks | null>(null)
  const drink = ref<Drink | null>(null)
  const currentSearch = ref('')
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadDrinks = useMemoize(async (search: string = '') => await fetchDrinksQuery(search))
  const loadDrinksByCategory = useMemoize(async (categorySlug: string) => await drinksByCategoryQuery(categorySlug))
  const loadDrink = useMemoize(async (key: string) => await drinkQuery(key))

  interface ValidateCacheParams {
    ref: typeof drinks | typeof drink
    query: any // Relaxed type for now or typeof fetchDrinksQuery
    key: string
    loaderFn: typeof loadDrinks | typeof loadDrink
  }

  const validateCache = ({ ref, query, key, loaderFn }: ValidateCacheParams) => {
    if (ref.value) {
      const finalQuery = typeof query === 'function' ? query(key as string) : query

      finalQuery.then(({ data, error }: { data: any, error: any }) => {
        if (JSON.stringify(ref.value) === JSON.stringify(data)) {
          return
        } else {
          loaderFn.delete(key as string)
          if (!error && data) ref.value = data
        }
      })
    }
  }

  const getDrinks = async (search: string = '') => {
    // drinks.value = null // Removed to prevent UI flashing during updates
    currentSearch.value = search

    const { data, error, status } = await loadDrinks(search)

    if (error) useErrorStore().setError({ error, customCode: status })
    if (data) drinks.value = data

    validateCache({ ref: drinks, query: (s: string) => fetchDrinksQuery(s), key: search, loaderFn: loadDrinks })
  }

  const getDrinksByCategory = async (categorySlug: string) => {
    // categoryDrinks.value = null // Removed to prevent UI flashing

    const { data, error, status } = await loadDrinksByCategory(categorySlug)

    if (error) useErrorStore().setError({ error, customCode: status })
    if (data) categoryDrinks.value = data

    validateCache({ 
      ref: categoryDrinks, 
      query: (key) => drinksByCategoryQuery(key), 
      key: categorySlug, 
      loaderFn: loadDrinksByCategory 
    })
  }

  const getDrink = async (id: string) => {
    // drink.value = null // Don't clear, just overwrite when data comes to avoid UI flicker

    try {
      // Use the SWR API endpoint instead of direct DB query
      let { data, isRevalidating } = await drinkApi.fetchDrinkById(id)
      
      if (data) {
        drink.value = data
      }

      // Poll if revalidation is occurring - Run in background (do not await)
      if (isRevalidating) {
        pollForUpdates(id)
      }
    } catch (error: any) {
      useErrorStore().setError({ 
        error: error.message || 'Failed to fetch drink', 
        customCode: error.response?.status || 500 
      })
    }
  }

  const pollForUpdates = async (id: string) => {
    const maxAttempts = 5
    let attempts = 0
    let isRevalidating = true

    while (isRevalidating && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 3000)) // Wait 3s
        attempts++

        try {
            const result = await drinkApi.fetchDrinkById(id)
            const data = result.data
            isRevalidating = result.isRevalidating
            
            if (data && JSON.stringify(data) !== JSON.stringify(drink.value)) {
                 drink.value = data
                 
                 // Update list cache if exists
                 if (drinks.value) {
                    const idx = drinks.value.findIndex(d => d.id === data.id)
                    if (idx !== -1) {
                        drinks.value[idx] = data
                    }
                 }
            }
        } catch (e) {
            console.error('[Store] Polling error', e)
            isRevalidating = false
        }
    }
  }

  const updateDrink = async (id: number, updates: Partial<Drink>) => {
    const { error, status } = await updateDrinkQuery(updates, id)
    
    if (error) {
      useErrorStore().setError({ error, customCode: status })
      return false
    }

    // 1. Optimistic Update (Immediate Feedback)
    if (drinks.value) {
        const index = drinks.value.findIndex(d => d.id === id)
        if (index !== -1) {
            drinks.value[index] = { ...drinks.value[index], ...updates }
        }
    }

    // 2. Refresh detail view if open
    if (drink.value?.id === id) {
      await getDrink(id.toString())
    }
    
    // 3. Invalidate Cache & Refresh using CURRENT SEARCH
    loadDrinks.delete(currentSearch.value) // Force fresh fetch for current view
    await getDrinks(currentSearch.value)

    return true
  }

  const deleteDrink = async () => {
    if (!drink.value) return

    const { error, status } = await deleteDrinkQuery(drink.value.id)
    if (error) useErrorStore().setError({ error, customCode: status })

    loadDrinks.delete(currentSearch.value)
    getDrinks(currentSearch.value)
  }

  // Real-time updates
  const initSocket = () => {
    
    socket.on('drink:created', () => {
        getDrinks() // Refresh list
    })

    socket.on('drink:updated', async (payload) => {
        // Always refresh list
        getDrinks()

        // If currently viewing THIS drink, refresh detail
        // Convert both to strings to ensure match
        if (drink.value && String(drink.value.id) === String(payload.id)) {
            await getDrink(String(payload.id))
        }
    })

    socket.on('drink:deleted', (payload) => {
        getDrinks()
        if (drink.value && String(drink.value.id) === String(payload.id)) {
            drink.value = null // Clear changed data
        }
    })
  }

  return {
    drinks,
    categoryDrinks,
    drink,
    getDrinks,
    getDrinksByCategory,
    getDrink,
    updateDrink,
    deleteDrink,
    pollForUpdates,
    initSocket
  }
})

