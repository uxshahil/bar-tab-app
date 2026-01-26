import type { Collabs } from '@/services/supabase/queries'

export type GroupedCollabs = {
  [key: string]: Collabs
}
