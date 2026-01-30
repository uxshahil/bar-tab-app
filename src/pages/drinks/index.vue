<script setup lang="ts">
import { columns } from '@/components/ui/data-table-columns/DataTableColumnsDrinks'
import { fetchDrinks } from '@/services/supabase/queries/drinkQueries'
import { useRoute } from 'vue-router'
import type { Drinks, Drink } from '@/services/supabase/types/drinkTypes'
import AppDrinkSheet from '@/components/app/drinks/AppDrinkSheet.vue'
import AppResourcePage from '@/components/common/AppResourcePage.vue'



const route = useRoute()

const drinks = ref<Drinks | null>(null)

// Add to Tab Logic (Global Store)
import { useAddToTabStore } from '@/stores/ui/addToTab'
const addToTabStore = useAddToTabStore()

const isDrinkSheetOpen = ref(false)
const editingDrinkId = ref<number | null>(null)

const onEditDrink = (drink: Drink) => {
  editingDrinkId.value = drink.id
  isDrinkSheetOpen.value = true
}

const getDrinks = async (search?: string) => {
  const { data, error, status } = await fetchDrinks(search)

  if (error) useErrorStore().setError({ error, customCode: status })

  drinks.value = data
}

const onAddToTab = (drink: Drink) => {
  addToTabStore.open(drink)
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
  <AppResourcePage
    title="Drinks"
    :data="drinks"
    :columns="columns"
    :loading="!drinks"
    :options="{
      meta: {
        onAddToTab,
        onEditDrink
      }
    }"
  >
    <template #sheet>
      <AppDrinkSheet 
        v-model:open="isDrinkSheetOpen" 
        :drink-id="editingDrinkId"
        @close="editingDrinkId = null"
      />
    </template>
  </AppResourcePage>
</template>
