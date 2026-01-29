<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppActiveTabs from '@/components/app/tab/AppActiveTabs.vue'
import AppTabDetailsSheet from '@/components/app/tab/AppTabDetailsSheet.vue'
import GlobalSearch from '@/components/app/search/GlobalSearch.vue'

const authStore = useAuthStore()
const { profile } = storeToRefs(authStore)
const { profileInitials } = authStore

import { menuKey, type MenuInjectionOptions } from '@/providers/injectionKeys'
const { rightSidebarOpen, toggleRightSidebar } = inject(menuKey) as MenuInjectionOptions

const router = useRouter()
const route = useRoute()
const isDark = useDark()
const toggleDark = useToggle(isDark)

const isTabDetailsOpen = ref(false)
const selectedTabId = ref<string | number>('')

const onTabSelected = (tab: any) => {
  // If we are on the dashboard, update the query param
  if (route.path === '/') {
    router.push({ query: { ...route.query, tabId: tab.id } })
  } else {
    // Otherwise open the sheet (fallback for other pages)
    selectedTabId.value = tab.id
    isTabDetailsOpen.value = true
  }
}
</script>

<template>
  <nav class="h-16 border-b bg-muted/40 flex gap-2 justify-between px-6 items-center">
    
    <div class="gap-x-2 flex flex col w-full">
    <AppActiveTabs @tab-selected="onTabSelected" />
    <GlobalSearch />
    </div>
    
    <div class="flex justify-center items-center gap-1">
      <Button @click="toggleRightSidebar" variant="outline" size="icon" class="w-8 h-8 mr-2">
        <Transition name="scale" mode="out-in">
          <iconify-icon v-if="rightSidebarOpen" icon="lucide:panel-right-close" />
          <iconify-icon v-else icon="lucide:panel-right-open" />
        </Transition>
      </Button>

      <Button @click="toggleDark()" class="w-8 h-8">
        <Transition name="scale" mode="out-in">
          <iconify-icon v-if="isDark" icon="lucide:sun" />
          <iconify-icon v-else icon="lucide:moon" />
        </Transition>
      </Button>
      <div class="w-8">
        <DropdownMenu v-if="profile">
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage
                :src="profile?.avatar_url ?? ''"
                :alt="`${profile?.full_name} profile picture`"
              />
              <AvatarFallback>
                {{ profileInitials() }}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <RouterLink :to="`/users/${profile.username}`" class="w-full h-full">
                Profile
              </RouterLink>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
    
    <AppTabDetailsSheet 
      v-model:open="isTabDetailsOpen"
      :tab-id="selectedTabId"
    />
  </nav>
</template>
