<script setup lang="ts">
import { columns } from '@/components/ui/data-table-columns/DataTableColumnsBars'
import { barsQuery } from '@/services/supabase/queries/barQueries'
import type { Bars } from '@/services/supabase/types/barTypes'
import AppResourcePage from '@/components/common/AppResourcePage.vue'



const bars = ref<Bars | null>(null)
const getBars = async () => {
  const { data, error, status } = await barsQuery

  if (error) useErrorStore().setError({ error, customCode: status })

  bars.value = data
}

await getBars()
</script>

<template>
  <AppResourcePage
    title="Bars"
    :data="bars"
    :columns="columns"
    :loading="!bars"
    :options="{}"
  />
</template>
