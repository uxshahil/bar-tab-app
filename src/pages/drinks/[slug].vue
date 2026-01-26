<script setup lang="ts">
import { drinkQuery } from '@/services/supabase/queries'
import type { Drink } from '@/services/supabase/queries'

const userRoute = useRoute('/drinks/[slug]')

const drink = ref<Drink | null>(null)

watch(
  () => drink.value?.name,
  () => {
    usePageStore().pageData.title = `Drink: ${drink.value?.name || ''}`
  },
)

const getDrink = async () => {
  const { data, error, status } = await drinkQuery(userRoute?.params?.slug)

  if (error) useErrorStore().setError({ error, customCode: status })

  drink.value = data
}

await getDrink()
</script>

<template>
  <Table v-if="menu">
    <TableRow>
      <TableHead> Name </TableHead>
      <TableCell> {{ menu.name }} </TableCell>
    </TableRow>
    <TableRow>
      <TableHead> Menus </TableHead>
      <!-- <TableCell>
        <div class="flex">
          <Avatar
            class="-mr-4 border border-primary hover:scale-110 transition-transform"
            v-for="menu in menu.menus"
            :key="menu"
          >
            <RouterLink class="w-full h-full flex items-center justify-center" to="">
              <AvatarImage src="" alt="" />
              <AvatarFallback> {{ menu }}</AvatarFallback>
            </RouterLink>
          </Avatar>
        </div>
      </TableCell> -->
    </TableRow>
  </Table>
</template>

<style>
th {
  width: 100px;
  /* @apply w-[100px]; */
}

h2 {
  margin-bottom: 16px;
  font-size: 1.125rem;
  font-weight: 600;
  width: fit-content;
  /* @apply mb-4 text-lg font-semibold w-fit; */
}

.table-container {
  overflow: hidden;
  overflow-y: auto;
  border-radius: 0.375rem;
  background-color: #0f172a;
  height: 20rem;
  /* @apply overflow-hidden overflow-y-auto rounded-md bg-slate-900 h-80; */
}
</style>
