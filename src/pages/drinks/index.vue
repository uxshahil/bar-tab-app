<script setup lang="ts">
import { columns } from '@/components/ui/data-table-columns/DataTableColumnsDrinks'
import { drinksQuery } from '@/services/supabase/queries'
import type { Drinks } from '@/services/supabase/queries'

usePageStore().pageData.title = 'Drinks'

const drinks = ref<Drinks | null>(null)
const getDrinks = async () => {
  const { data, error, status } = await drinksQuery

  if (error) useErrorStore().setError({ error, customCode: status })

  drinks.value = data
}

await getDrinks()
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
