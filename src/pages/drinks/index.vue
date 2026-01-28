<script setup lang="ts">
import { columns } from '@/components/ui/data-table-columns/DataTableColumnsDrinks'
import { fetchDrinks } from '@/services/supabase/queries/drinkQueries'
import { useRoute } from 'vue-router'
import type { Drinks } from '@/services/supabase/types/drinkTypes'

usePageStore().pageData.title = 'Drinks'

const route = useRoute()

const drinks = ref<Drinks | null>(null)
const getDrinks = async (search?: string) => {
  const { data, error, status } = await fetchDrinks(search)

  if (error) useErrorStore().setError({ error, customCode: status })

  drinks.value = data
}

// Load initially using current query param
await getDrinks(route.query.search as string | undefined)

// React to search query changes (e.g. from navbar)
watch(
  () => route.query.search,
  (newSearch) => {
    getDrinks(newSearch as string | undefined)
  },
)
</script>

<template>
  <DataTable
    v-if="drinks"
    :data="drinks"
    :columns="columns"
    :loading="!drinks"
    class="w-full"
    :empty-text="'No drinks found'"
  />
</template>
