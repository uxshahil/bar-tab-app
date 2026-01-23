<script setup lang="ts">
import { barQuery } from '@/utils/supaQueries'
import type { Bar } from '@/utils/supaQueries'

const userRouteWithIdParam = useRoute('/bars/[slug]')

const bar = ref<Bar | null>(null)

watch(
  () => bar.value?.name,
  () => {
    usePageStore().pageData.title = `Bar: ${bar.value?.name || ''}`
  },
)

const getBar = async () => {
  const { data, error, status } = await barQuery(userRouteWithIdParam.params?.slug)

  if (error) useErrorStore().setError({ error, customCode: status })

  bar.value = data
}

await getBar()
</script>

<template>
  <Table v-if="bar">
    <TableRow>
      <TableHead> Name </TableHead>
      <TableCell> {{ bar.name }} </TableCell>
    </TableRow>
    <TableRow>
      <TableHead> Menus </TableHead>
      <TableCell>
        <div class="flex">
          <Avatar
            class="-mr-4 border border-primary hover:scale-110 transition-transform"
            v-for="menu in bar.menus"
            :key="menu"
          >
            <RouterLink class="w-full h-full flex items-center justify-center" to="">
              <AvatarImage src="" alt="" />
              <AvatarFallback> {{ menu }}</AvatarFallback>
            </RouterLink>
          </Avatar>
        </div>
      </TableCell>
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
