import type { ColumnDef } from '@tanstack/vue-table'
import type { Profiles } from '@/services/supabase/types/profileTypes'
import { RouterLink } from 'vue-router'

export const columns: ColumnDef<Profiles[0]>[] = [
  {
    accessorKey: 'username',
    header: () => h('div', { class: 'text-left' }, 'Name'),
    cell: ({ row }) => {
      const username = row.original.username
      return h(
        RouterLink,
        {
          to: `/users/${username}`,
          class: 'text-left font-medium hover:bg-muted block w-full'
        },
        () => username
      )
    }
  },
  {
    accessorKey: 'user_role',
    header: () => h('div', { class: 'text-left' }, 'Role'),
    cell: ({ row }) => {
      const role = row.original.user_role
      return h('div', { class: 'text-left' }, role)
    }
  }
]
