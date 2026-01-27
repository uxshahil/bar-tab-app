<script setup lang="ts">
import { columns } from '@/components/ui/data-table-columns/DataTableColumnsUsers'
import { profilesQuery } from '@/services/supabase/queries/profileQueries'
import type { Profiles as Users } from '@/services/supabase/types/profileTypes'

usePageStore().pageData.title = 'Users'

const users = ref<Users | null>(null)
const getUsers = async () => {
  const { data, error, status } = await profilesQuery()

  if (error) useErrorStore().setError({ error, customCode: status })

  users.value = data
}

await getUsers()
</script>

<template>
  <DataTable
    v-if="users"
    :data="users"
    :columns="columns"
    :loading="!users"
    class="w-full"
    :empty-text="'No users found'"
  />
</template>
