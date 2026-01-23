<script setup lang="ts">
import { columns } from '@/utils/tableColumns/drinksColumns'
import { drinksQuery } from '@/utils/supaQueries'
import type { Drinks } from '@/utils/supaQueries'

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
