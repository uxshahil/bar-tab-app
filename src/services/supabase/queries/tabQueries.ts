import { supabase } from '@/providers/supabaseClient'
import type { Tab, TabItem, TabSplit, TabInsert, TabItemInsert, TabPaymentInsert, TabSplitInsert } from '@/services/supabase/types/tabTypes'

// Fetch all tabs (visible to all users)
export const tabsQuery = () => supabase
  .from('tab')
  .select('*')
  .order('created_at', { ascending: false })

// Fetch single tab with all related data
export const tabQuery = (tabId: string | number) => supabase
  .from('tab')
  .select(`
    *,
    tab_item(*),
    tab_split(*),
    tab_payment(*)
  `)
  .eq('id', Number(tabId))
  .single()

// Fetch tabs assigned to a specific user
export const userTabsQuery = (userId: string) => supabase
  .from('tab')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })

// Fetch open tabs only
export const openTabsQuery = () => supabase
  .from('tab')
  .select('*')
  .eq('status', 'open')
  .order('created_at', { ascending: false })

// Fetch tab items for a specific tab
export const tabItemsQuery = (tabId: string | number) => supabase
  .from('tab_item')
  .select('*, menu_item(name)')
  .eq('tab_id', Number(tabId))
  .order('created_at', { ascending: true })

// Fetch splits for a tab
export const tabSplitsQuery = (tabId: string | number) => supabase
  .from('tab_split')
  .select('*')
  .eq('tab_id', Number(tabId))
  .order('split_number', { ascending: true })

// Fetch payments for a tab
export const tabPaymentsQuery = (tabId: string | number) => supabase
  .from('tab_payment')
  .select('*')
  .eq('tab_id', Number(tabId))
  .order('created_at', { ascending: false })

// Create a new tab
export const createTabQuery = (tabData: TabInsert) => supabase
  .from('tab')
  .insert(tabData)
  .select()

// Update tab
export const updateTabQuery = (tabId: string | number, updates: Partial<Tab>) => supabase
  .from('tab')
  .update(updates)
  .eq('id', Number(tabId))
  .select()

// Add item to tab
export const addTabItemQuery = (itemData: TabItemInsert) => supabase
  .from('tab_item')
  .insert(itemData)
  .select()

// Update tab item
export const updateTabItemQuery = (itemId: string | number, updates: Partial<TabItem>) => supabase
  .from('tab_item')
  .update(updates)
  .eq('id', Number(itemId)) // Fix: Explicitly cast to Number
  .select()

export const deleteTabItemQuery = (itemId: string | number) => supabase
  .from('tab_item')
  .delete()
  .eq('id', Number(itemId)) // Fix: Explicitly cast to Number

export const createTabPaymentQuery = (paymentData: TabPaymentInsert) => supabase
  .from('tab_payment')
  .insert(paymentData)
  .select()

// Create tab split
export const createTabSplitQuery = (splitData: TabSplitInsert) => supabase
  .from('tab_split')
  .insert(splitData)
  .select()

// Update tab split
export const updateTabSplitQuery = (splitId: string | number, updates: Partial<TabSplit>) => supabase
  .from('tab_split')
  .update(updates)
  .eq('id', splitId as number)
  .select()
