<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'
import { ref, computed, watch } from 'vue'

const authStore = useAuthStore()
const { profile } = storeToRefs(authStore)
const { profileInitials } = authStore

const isDark = useDark()
const toggleDark = useToggle(isDark)

const route = useRoute()
const router = useRouter()
const searchQuery = ref('')

// Dynamic placeholder based on route
const searchPlaceholder = computed(() => {
  const path = route.path

  if (path.includes('/drinks')) {
    return 'Search drinks...'
  } else if (path.includes('/users')) {
    return 'Search users...'
  } else if (path.includes('/ingredients')) {
    return 'Search ingredients...'
  } else if (path.includes('/categories')) {
    return 'Search categories...'
  } else {
    return 'Search...'
  }
})

// Handle search based on current route
const handleSearch = () => {
  if (!searchQuery.value.trim()) return

  const path = route.path

  if (path.includes('/drinks')) {
    // Search drinks - could redirect to a search results page or filter current list
    router.push({
      path: '/drinks',
      query: { search: searchQuery.value },
    })
  } else if (path.includes('/users')) {
    // Search users
    router.push({
      path: '/users',
      query: { search: searchQuery.value },
    })
  } else if (path.includes('/ingredients')) {
    // Search ingredients
    router.push({
      path: '/ingredients',
      query: { search: searchQuery.value },
    })
  }
  // Add more routes as needed
}

// Optional: Clear search when route changes
watch(
  () => route.path,
  () => {
    searchQuery.value = ''
  },
)
</script>

<template>
  <nav class="h-16 border-b bg-muted/40 flex gap-2 justify-between px-6 items-center">
    <form class="relative h-fit w-full max-w-96" @submit.prevent="handleSearch">
      <iconify-icon
        class="absolute top-[50%] translate-y-[-50%] left-2.5 text-muted-foreground"
        icon="lucide:search"
      ></iconify-icon>
      <Input
        v-model="searchQuery"
        class="w-full pl-8 bg-background"
        type="text"
        :placeholder="searchPlaceholder"
        @keyup.enter="handleSearch"
      />
      <!-- Optional: Add a submit button -->
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        class="absolute top-[50%] translate-y-[-50%] right-1.5 h-6 w-6 p-0"
      >
        <iconify-icon icon="lucide:arrow-right" />
      </Button>
    </form>
    <div class="flex justify-center items-center gap-1">
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
  </nav>
</template>
