import type { ColumnDef } from '@tanstack/vue-table'
import type { Bars } from '@/services/supabase/queries'
import { RouterLink } from 'vue-router'

export const columns: ColumnDef<Bars[0]>[] = [
  {
    accessorKey: 'slug',
    header: () => h('div', { class: 'text-left' }, 'Name'),
    cell: ({ row }) => {
      const slug = row.getValue('slug') as string

      return h(
        'div',
        { class: 'text-left flex flex-wrap gap-2' },
        h(
          RouterLink,
          {
            to: `/bars/${slug}`,
            class: `text-left font-medium`
          },
          () => row.original.name
        )
      )
    }
  },
  {
    accessorKey: 'menus',
    header: () => h('div', { class: 'text-left' }, 'Menus'),
    cell: ({ row }) => {
      const slug = row.original.slug
      const menus = row.getValue('menus') as string[]

      if (!menus || menus.length === 0) {
        return h('div', { class: 'text-left text-gray-500' }, 'No menus')
      }

      return h(
        'div',
        { class: 'text-left flex flex-wrap gap-2' },
        menus.map(menu =>
          h(
            RouterLink,
            {
              to: `/bars/${slug}/menus/${menu.toLowerCase().replace(/\s+/g, '-')}`,
              class: `text-left font-medium`
            },
            () => menu
          )
        )
      )
    }
  }
]
