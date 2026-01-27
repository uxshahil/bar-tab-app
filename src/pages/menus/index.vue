<script setup lang="ts">
import { columns } from '@/components/ui/data-table-columns/DataTableColumnsMenus'
import { menusWithCategoriesQuery } from '@/services/supabase/queries/menuQueries'
import type { MenusWithCategories } from '@/services/supabase/types/menuTypes'

usePageStore().pageData.title = 'Menus'

const menus = ref<MenusWithCategories | null>(null)
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
