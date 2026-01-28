<script setup lang="ts">
import { menuKey } from '@/providers/injectionKeys'
import { useTabSheetStore } from '@/stores/tabSheet'

const { pageData } = storeToRefs(usePageStore())
const tabSheetStore = useTabSheetStore()

const taskSheetOpen = ref({ user: false, tab: false, drink: false })

const menuOpen = ref(false)
const toggleMenu = () => (menuOpen.value = !menuOpen.value)

const userClicked = () => {
  taskSheetOpen.value = { user: true, tab: false, drink: false }
}

const tabClicked = () => {
  taskSheetOpen.value = { user: false, tab: true, drink: false }
}

const drinkClicked = () => {
  taskSheetOpen.value = { user: false, tab: false, drink: true }
}

provide(menuKey, {
  menuOpen,
  toggleMenu,
})
</script>

<template>
  <div>
    <Sidebar @userClicked="userClicked" @tabClicked="tabClicked" @drinkClicked="drinkClicked" />
    <AppNewUser v-model="taskSheetOpen.user" />
    <AppNewTab v-model="taskSheetOpen.tab" />
    <AppNewDrink v-model="taskSheetOpen.drink" />

    <!-- Global Tab Sheet -->
    <TabSheet />

    <div
      class="flex flex-col transition-[margin]"
      :class="{ 'ml-52': menuOpen, 'ml-24': !menuOpen }"
    >
      <TopNavbar />

      <main class="flex flex-col flex-1 gap-4 p-4 lg:gap-6 lg:p-6">
        <div class="flex items-center">
          <h1 class="text-lg font-semibold md:text-2xl">{{ pageData.title }}</h1>
        </div>
        <slot />
      </main>
    </div>
  </div>
</template>
