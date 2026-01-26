<script setup lang="ts">
import { columns } from '@/components/ui/data-table-columns/DataTableColumnsMenus'
import { menusWithCategoriesQuery } from '@/services/supabase/queries'
import type * as SupaQueries from '@/services/supabase/queries'

usePageStore().pageData.title = 'Menus'

const menus = ref<SupaQueries.MenusWithCategories | null>(null)
const getMenus = async () => {
  const { data, error, status } = await menusWithCategoriesQuery

  if (error) useErrorStore().setError({ error, customCode: status })

  menus.value = data
}

await getMenus()
</script>

<template>
  <DataTable
    v-if="menus"
    :data="menus"
    :columns="columns"
    :loading="!menus"
    class="w-full"
    :empty-text="'No menus found'"
  />
</template>
