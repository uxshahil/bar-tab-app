<script setup lang="ts">
import { columns } from '@/components/ui/data-table-columns/DataTableColumnsDrink'
import { drinkQuery } from '@/services/supabase/queries/drinkQueries'
import type { Drink } from '@/services/supabase/types/drinkTypes'

const userRoute = useRoute('/drinks/[slug]')

const drink = ref<Drink | null>(null)

watch(
  () => drink.value?.name,
  () => {
    usePageStore().pageData.title = `Drink: ${drink.value?.name || ''}`
  },
)

const getDrink = async () => {
  const { data, error, status } = await drinkQuery(userRoute?.params?.slug)

  if (error) useErrorStore().setError({ error, customCode: status })

  drink.value = data
}

await getDrink()
</script>

<template>
  <template v-if="drink">
    <DataTable
      v-if="drink"
      :data="[drink]"
      :columns="columns"
      :loading="!drink"
      class="w-full"
      :empty-text="'No drinks found'"
    />
  </template>
</template>
