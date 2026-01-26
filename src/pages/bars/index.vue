<script setup lang="ts">
import { columns } from '@/components/ui/data-table-columns/DataTableColumnsBars'
import { barsQuery } from '@/services/supabase/queries'
import type { Bars } from '@/services/supabase/queries'

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
