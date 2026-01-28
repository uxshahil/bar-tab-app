<script setup lang="ts">
import { columns } from '@/components/ui/data-table-columns/DataTableColumnsDrinks'
import { fetchDrinks } from '@/services/supabase/queries/drinkQueries'
import { useRoute } from 'vue-router'
import type { Drinks, Drink } from '@/services/supabase/types/drinkTypes'
import AppAddToTab from '@/components/app/tab/AppAddToTab.vue'
import AppTabsList from '@/components/app/tab/AppTabsList.vue'
import AppTabDetails from '@/components/app/tab/AppTabDetails.vue'
import { Button } from '@/components/ui/button'

usePageStore().pageData.title = 'Dashboard'

const route = useRoute()

const drinks = ref<Drinks | null>(null)
const selectedDrink = ref<Drink | null>(null)
const isAddToTabOpen = ref(false)
const selectedTabId = ref<string | number | null>(null)

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

const onTabSelected = (tabId: number) => {
  selectedTabId.value = tabId
}

const clearSelection = () => {
  selectedTabId.value = null
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
  <div class="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">
    <!-- Main Content (Left) - Always Menu -->
    <div class="col-span-8 flex flex-col gap-4 h-full">
      <div class="flex-1 overflow-hidden border rounded-lg bg-card relative">
        <div v-if="drinks" class="h-full overflow-auto">
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
    </div>

    <!-- Sidebar (Right) - Tabs List or Details -->
    <div class="col-span-4 border-l h-full overflow-hidden flex flex-col">
      <!-- Tab Details View -->
      <div v-if="selectedTabId" class="h-full flex flex-col">
        <div class="mb-2 p-4">
          <Button variant="ghost" size="sm" @click="clearSelection" class="-ml-2 text-muted-foreground hover:text-foreground">
            <iconify-icon icon="lucide:arrow-left" class="mr-1" />
            Back to Tabs
          </Button>
        </div>
        <div class="flex-1 overflow-auto pr-2">
          <AppTabDetails :key="selectedTabId" :tab-id="selectedTabId" />
        </div>
      </div>

      <!-- Tabs List View -->
      <div v-else class="h-full overflow-hidden">
        <AppTabsList @select-tab="onTabSelected" />
      </div>
    </div>

    <AppAddToTab 
      v-model:open="isAddToTabOpen"
      :drink="selectedDrink"
    />
  </div>
</template>
