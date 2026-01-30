import {
  drinksQuery,
  drinkQuery,
  updateDrinkQuery,
  deleteDrinkQuery
} from '@/services/supabase/queries/drinkQueries'
import { useMemoize } from '@vueuse/core'
import type { Drink, Drinks } from '@/services/supabase/types/drinkTypes'

export const useDrinksStore = defineStore('drinks-store', () => {
  const drinks = ref<Drinks | null>(null)
  const drink = ref<Drink | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadDrinks = useMemoize(async (_key: string) => await drinksQuery)
  const loadDrink = useMemoize(async (key: string) => await drinkQuery(key))

  interface ValidateCacheParams {
    ref: typeof drinks | typeof drink
    query: typeof drinksQuery | typeof drinkQuery
    key: string
    loaderFn: typeof loadDrinks | typeof loadDrink
  }

  const validateCache = ({ ref, query, key, loaderFn }: ValidateCacheParams) => {
    if (ref.value) {
      const finalQuery = typeof query === 'function' ? query(key as string) : query

      finalQuery.then(({ data, error }) => {
        if (JSON.stringify(ref.value) === JSON.stringify(data)) {
          return
        } else {
          loaderFn.delete(key as string)
          if (!error && data) ref.value = data
        }
      })
    }
  }

  const getDrinks = async () => {
    drinks.value = null

    const { data, error, status } = await loadDrinks('drinks')

    if (error) useErrorStore().setError({ error, customCode: status })
    if (data) drinks.value = data

    validateCache({ ref: drinks, query: drinksQuery, key: 'drinks', loaderFn: loadDrinks })
  }

  const getDrink = async (id: string) => {
    drink.value = null

    const { data, error, status } = await loadDrink(id)

    if (error) useErrorStore().setError({ error, customCode: status })
    if (data) drink.value = data

    validateCache({ ref: drink, query: drinkQuery, key: id, loaderFn: loadDrink })
  }

  const updateDrink = async (id: number, updates: Partial<Drink>) => {
    const { error, status } = await updateDrinkQuery(updates, id)
    
    if (error) {
      useErrorStore().setError({ error, customCode: status })
      return false
    }

    // Refresh list if needed or update local state
    // For now, simpler invalidation is safer
    if (drink.value?.id === id) {
      await getDrink(id.toString())
    }
    
    // Also refresh the main list
    await getDrinks()

    return true
  }

  const deleteDrink = async () => {
    if (!drink.value) return

    const { error, status } = await deleteDrinkQuery(drink.value.id)
    if (error) useErrorStore().setError({ error, customCode: status })

    getDrinks()
  }

  return {
    drinks,
    drink,
    getDrinks,
    getDrink,
    updateDrink,
    deleteDrink
  }
})

