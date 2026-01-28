<script setup lang="ts">
import { columns } from '@/components/ui/data-table-columns/DataTableColumnsDrinks'
import { fetchDrinks } from '@/services/supabase/queries/drinkQueries'
import { useRoute } from 'vue-router'
import type { Drinks, Drink } from '@/services/supabase/types/drinkTypes'
import AppAddToTab from '@/components/app/tab/AppAddToTab.vue'

usePageStore().pageData.title = 'Drinks'

const route = useRoute()

const drinks = ref<Drinks | null>(null)
const selectedDrink = ref<Drink | null>(null)
const isAddToTabOpen = ref(false)

const getDrinks = async (search?: string) => {
  const { data, error, status } = await fetchDrinks(search)

  if (error) useErrorStore().setError({ error, customCode: status })

  drinks.value = data
}

const onAddToTab = (drink: Drink) => {
  selectedDrink.value = drink
  isAddToTabOpen.value = true
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
  <div class="relative">
    <DataTable
      v-if="drinks"
      :data="drinks"
      :columns="columns"
      :loading="!drinks"
      class="w-full"
      :empty-text="'No drinks found'"
      :options="{
        meta: {
          onAddToTab
        }
      }"
    />

    <AppAddToTab 
      v-model:open="isAddToTabOpen"
      :drink="selectedDrink"
    />
  </div>
</template>
