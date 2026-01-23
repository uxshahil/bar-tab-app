import type { ColumnDef } from '@tanstack/vue-table'
import type { Drinks } from '../supaQueries'
import { RouterLink } from 'vue-router'
import { h } from 'vue'

export const columns: ColumnDef<Drinks[0]>[] = [
  {
    accessorKey: 'menu',
    header: () => h('div', { class: 'text-left' }, 'Menu'),
    cell: ({ row }) =>
      h('div', { class: 'text-left' }, row.getValue<Drinks[0]['category']>('category')?.menu.name)
  },
  {
    accessorKey: 'category',
    header: () => h('div', { class: 'text-left' }, 'Category'),
    cell: ({ row }) =>
      h('div', { class: 'text-left' }, row.getValue<Drinks[0]['category']>('category')?.name)
  },
  {
    accessorKey: 'name',
    header: () => h('div', { class: 'text-left' }, 'Name'),
    cell: ({ row }) => {
      const slug = row.original.slug
      return h(
        RouterLink,
        {
          to: `/menu/${slug}`,
          class: 'text-left font-medium hover:bg-muted block w-full'
        },
        () => row.original.name
      )
    }
  },
  {
    accessorKey: 'price',
    header: () => h('div', { class: 'text-left' }, 'Price (ZAR)'),
    cell: ({ row }) => h('div', { class: 'text-left' }, row.getValue('price'))
  }
]
