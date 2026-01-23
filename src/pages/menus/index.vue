<script setup lang="ts">
import { columns } from '@/utils/tableColumns/menusColumns'
import { menusWithCategoriesQuery } from '@/utils/supaQueries'
import type { MenusWithCategories } from '@/utils/supaQueries'

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
