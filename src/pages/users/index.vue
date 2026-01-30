<script setup lang="ts">
import { columns } from '@/components/ui/data-table-columns/DataTableColumnsUsers'
import { useUsersStore } from '@/stores/loaders/users'
import { storeToRefs } from 'pinia'
import AppUserSheet from '@/components/app/users/AppUserSheet.vue'
import AppResourcePage from '@/components/common/AppResourcePage.vue'

const usersStore = useUsersStore()
const { users } = storeToRefs(usersStore)

// Initial fetch
usersStore.getUsers()

const isUserSheetOpen = ref(false)
const editingUser = ref<any>(null)

const onEditUser = (user: any) => {
  editingUser.value = user
  isUserSheetOpen.value = true
}

const onRefresh = async () => {
  await usersStore.getUsers()
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
