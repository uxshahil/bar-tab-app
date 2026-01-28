<script setup lang="ts" generic="TData, TValue">
import type { ColumnDef } from '@tanstack/vue-table'
import { FlexRender, getCoreRowModel, getPaginationRowModel, useVueTable } from '@tanstack/vue-table'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

const props = defineProps<{
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  options?: any
}>()

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  initialState: {
    pagination: {
      pageSize: 10,
    },
  },
  ...props.options
})
</script>

<template>
  <div class="space-y-4">
    <div class="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <TableHead v-for="header in headerGroup.headers" :key="header.id">
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="table.getRowModel().rows?.length">
            <TableRow
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              :data-state="row.getIsSelected() ? 'selected' : undefined"
            >
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </TableCell>
            </TableRow>
          </template>
          <template v-else>
            <TableRow>
              <TableCell :colspan="columns.length" class="h-24 text-center"> No results. </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <div class="flex items-center justify-between px-2">
      <div class="flex-1 text-sm text-muted-foreground">
        Showing {{ table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1 }} to
        {{ Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length) }} of
        {{ table.getFilteredRowModel().rows.length }} entries
      </div>
      <div class="flex items-center space-x-6 lg:space-x-8">
        <Pagination 
          v-if="table.getPageCount() > 1" 
          :total="table.getFilteredRowModel().rows.length" 
          :items-per-page="table.getState().pagination.pageSize"
          :sibling-count="1" 
          show-edges 
          :default-page="1"
          :page="table.getState().pagination.pageIndex + 1"
          @update:page="(p) => table.setPageIndex(p - 1)"
        >
          <PaginationContent>
            <PaginationFirst 
              href="#" 
              @click.prevent="table.setPageIndex(0)"
              :class="{ 'pointer-events-none opacity-50': !table.getCanPreviousPage() }"
            />
            <PaginationPrevious 
              href="#" 
              @click.prevent="table.previousPage()" 
              :class="{ 'pointer-events-none opacity-50': !table.getCanPreviousPage() }"
            />
            
            <template v-for="(_, index) in table.getPageCount()" :key="index">
              <PaginationItem 
                v-if="
                  index === 0 || 
                  index === table.getPageCount() - 1 || 
                  (index >= table.getState().pagination.pageIndex - 1 && index <= table.getState().pagination.pageIndex + 1)
                "
                :value="index + 1"
                :is-active="table.getState().pagination.pageIndex === index"
              >
                {{ index + 1 }}
              </PaginationItem>
              <PaginationEllipsis v-else-if="
                (index === 1 && table.getState().pagination.pageIndex > 2) ||
                (index === table.getPageCount() - 2 && table.getState().pagination.pageIndex < table.getPageCount() - 3)
              " />
            </template>

            <PaginationNext 
              href="#" 
              @click.prevent="table.nextPage()"
              :class="{ 'pointer-events-none opacity-50': !table.getCanNextPage() }"
            />
            <PaginationLast 
              href="#" 
              @click.prevent="table.setPageIndex(table.getPageCount() - 1)"
              :class="{ 'pointer-events-none opacity-50': !table.getCanNextPage() }"
            />
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  </div>
</template>

<style scoped>
td {
  padding: 0;
}

td > * {
  padding: 16px;
}
</style>
