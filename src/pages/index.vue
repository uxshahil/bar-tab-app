<script setup lang="ts">
import { columns } from '@/components/ui/data-table-columns/DataTableColumnsDrinks'
import { fetchDrinks } from '@/services/supabase/queries/drinkQueries'
import { useRoute } from 'vue-router'
import type { Drinks, Drink } from '@/services/supabase/types/drinkTypes'
import AppAddToTab from '@/components/app/tab/AppAddToTab.vue'

usePageStore().pageData.title = 'Dashboard'

const route = useRoute()

const drinks = ref<Drinks | null>(null)
const selectedDrink = ref<Drink | null>(null)
const isAddToTabOpen = ref(false)

const getDrinks = async (search?: string) => {
  const { data, error, status } = await fetchDrinks(search)

  if (error) useErrorStore().setError({ error, customCode: status })

  drinks.value = data
}

const onAddToTab = async (drink: Drink) => {
  // Always open sheet to allow quantity/instruction selection
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
  <div class="h-full flex flex-col">
    <!-- Main Content - Drinks Table -->
    <div class="flex-1 overflow-hidden border rounded-lg relative">
      <div v-if="drinks" class="h-full overflow-auto bg-red">
        <DataTable
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
      </div>
    </div>

    <AppAddToTab 
      v-model:open="isAddToTabOpen"
      :drink="selectedDrink"
    />
  </div>
</template>
