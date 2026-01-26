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
    accessorKey: 'menu_name',
    header: () => h('div', { class: 'text-left' }, 'Menus'),
    cell: ({ row }) => {
      const barMenus = row.original.bar_menu
      console.log('barMenus', barMenus)

      if (!barMenus || barMenus.length === 0) {
        return h('div', { class: 'text-left text-gray-500' }, 'No menus')
      }

      return h(
        'div',
        { class: 'text-left flex flex-wrap gap-2' },
        barMenus.map(barMenu =>
          h(
            RouterLink,
            {
              to: `/${barMenu?.menu_name?.toLowerCase()}`,
              class: `text-left font-medium`
            },
            () => barMenu.menu_name
          )
        )
      )
    }
  }
]
