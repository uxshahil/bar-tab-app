import type { QueryData } from '@supabase/supabase-js'
import type {
  tabsQuery,
  tabQuery,
  userTabsQuery,
  openTabsQuery,
} from '../queries/tabQueries'

export type Tab = QueryData<ReturnType<typeof tabQuery>>
export type Tabs = QueryData<ReturnType<typeof tabsQuery>>
export type UserTabs = QueryData<ReturnType<typeof userTabsQuery>>
export type OpenTabs = QueryData<ReturnType<typeof openTabsQuery>>

export type TabItem = {
  id: number
  tab_id: number
  menu_item_id: number
  quantity: number
  unit_price: number
  item_total: number
  special_instructions: string | null
  created_at: string
  updated_at: string
}

export type TabItems = TabItem[]

export type TabSplit = {
  id: number
  tab_id: number
  split_number: number
  items_included: string[]
  subtotal: number
  tax_on_split: number
  total_owed: number
  amount_paid: number
  tip_amount: number | null
  status: 'pending' | 'settled'
  created_at: string
  updated_at: string
  settled_at: string | null
}

export type TabSplits = TabSplit[]

export type TabPayment = {
  id: number
  tab_id: number
  split_id: number | null
  amount_paid: number
  tip_added: number | null
  payment_method: 'cash' | 'card' | 'mobile' | 'mixed'
  status: 'pending' | 'completed' | 'failed'
  created_at: string
}

export type TabPayments = TabPayment[]

// Enums for status values
export enum TabStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  SETTLED = 'settled',
  SPLIT = 'split'
}

export enum TabSplitStatus {
  PENDING = 'pending',
  SETTLED = 'settled'
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  MOBILE = 'mobile',
  MIXED = 'mixed'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
}
