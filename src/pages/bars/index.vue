<script setup lang="ts">
import { columns } from '@/utils/tableColumns/barsColumns'
import { barsQuery } from '@/utils/supaQueries'
import type { Bars } from '@/utils/supaQueries'

usePageStore().pageData.title = 'Bars'

const bars = ref<Bars | null>(null)
const getBars = async () => {
  const { data, error, status } = await barsQuery

  if (error) useErrorStore().setError({ error, customCode: status })

  bars.value = data
}

await getBars()
</script>

<template>
  <DataTable
    v-if="bars"
    :data="bars"
    :columns="columns"
    :loading="!bars"
    class="w-full"
    :empty-text="'No bars found'"
  />
</template>
