<script setup lang="ts">
import { columns } from '@/components/ui/data-table-columns/DataTableColumnsUsers'
import { profilesQuery } from '@/services/supabase/queries/profileQueries'
import type { Profiles as Users } from '@/services/supabase/types/profileTypes'
import AppUserSheet from '@/components/app/users/AppUserSheet.vue'
import type { Profile } from '@/services/supabase/types/profileTypes'
import AppResourcePage from '@/components/common/AppResourcePage.vue'



const users = ref<Users | null>(null)
const getUsers = async () => {
  const { data, error, status } = await profilesQuery()

  if (error) useErrorStore().setError({ error, customCode: status })

  users.value = data
}

await getUsers()

const isUserSheetOpen = ref(false)
const editingUser = ref<Profile | null>(null)

const onEditUser = (user: Profile) => {
  editingUser.value = user
  isUserSheetOpen.value = true
}

const onRefresh = async () => {
  await getUsers()
}
</script>

<template>
  <AppResourcePage
    title="Users"
    :data="users"
    :columns="columns"
    :loading="!users"
    :options="{
      meta: {
          onEditUser
      }
    }"
  >
    <template #sheet>
      <AppUserSheet
          v-model:open="isUserSheetOpen"
          :user-to-edit="editingUser"
          @close="editingUser = null"
          @refresh="onRefresh"
      />
    </template>
  </AppResourcePage>
</template>
