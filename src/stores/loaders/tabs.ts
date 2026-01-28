import {
  tabsQuery,
  tabQuery,
  userTabsQuery,
  openTabsQuery,
  tabItemsQuery,
  tabSplitsQuery,
  tabPaymentsQuery,
  createTabQuery,
  updateTabQuery,
  addTabItemQuery,
  updateTabItemQuery,
  deleteTabItemQuery,
  createTabSplitQuery,
  updateTabSplitQuery,
  createTabPaymentQuery
} from '@/services/supabase/queries/tabQueries'
import { useMemoize } from '@vueuse/core'
import type { Tab, Tabs, TabItem, TabItems, TabSplit, TabSplits, TabPayments, TabSplitInsert } from '@/services/supabase/types/tabTypes'
import type { PostgrestSingleResponse } from '@supabase/supabase-js'

export const useTabsStore = defineStore('tabs-store', () => {
  // State
  const tabs = ref<Tabs | null>(null)
  const tab = ref<Tab | null>(null)
  const tabItems = ref<TabItems | null>(null)
  const tabSplits = ref<TabSplits | null>(null)
  const tabPayments = ref<TabPayments | null>(null)

  // Memoized loaders
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadTabs = useMemoize(async (_key: string = 'all-tabs') => {
    const response = await tabsQuery()
    return response
  })

  const loadTab = useMemoize(async (id: string) => {
    const response = await tabQuery(id)
    return response
  })

  const loadUserTabs = useMemoize(async (userId: string) => {
    const response = await userTabsQuery(userId)
    return response
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadOpenTabs = useMemoize(async (_key: string = 'open-tabs') => {
    const response = await openTabsQuery()
    return response
  })

  const loadTabItems = useMemoize(async (tabId: string) => {
    const response = await tabItemsQuery(tabId)
    return response
  })

  const loadTabSplits = useMemoize(async (tabId: string) => {
    const response = await tabSplitsQuery(tabId)
    return response
  })

  const loadTabPayments = useMemoize(async (tabId: string) => {
    const response = await tabPaymentsQuery(tabId)
    return response
  })

  interface ValidateCacheParams<T> {
    ref: Ref<T | null>
    queryFn: () => Promise<PostgrestSingleResponse<T>>
    key: string
    loaderFn: { delete: (key: string) => void }
  }

  // Validate and refresh cached data if needed
  const validateCache = <T>({ ref, queryFn, key, loaderFn }: ValidateCacheParams<T>) => {
    if (ref.value) {
      queryFn().then((response) => {
        const { data, error } = response
        if (JSON.stringify(ref.value) === JSON.stringify(data)) {
          return
        } else {
          loaderFn.delete(key)
          if (!error && data) ref.value = data
        }
      })
    }
  }

  // Helper to convert query builder to promise
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toPromise = <T>(queryBuilder: any): Promise<PostgrestSingleResponse<T>> => {
    return queryBuilder
  }

  // Get all tabs
  const getTabs = async () => {
    tabs.value = null

    const response = await loadTabs('all-tabs')
    const { data, error, status } = response

    if (error) useErrorStore().setError({ error, customCode: status })

    if (data) tabs.value = data

    validateCache({ 
      ref: tabs, 
      queryFn: () => toPromise(tabsQuery()),
      key: 'all-tabs', 
      loaderFn: loadTabs 
    })
  }

  // Get single tab with all details
  const getTab = async (id: string) => {
    tab.value = null

    const response = await loadTab(id)
    const { data, error, status } = response

    if (error) useErrorStore().setError({ error, customCode: status })

    if (data) tab.value = data

    validateCache({ 
      ref: tab, 
      queryFn: () => toPromise(tabQuery(id)),
      key: id, 
      loaderFn: loadTab 
    })
  }

  // Get tabs for current user
  const getUserTabs = async (userId: string) => {
    tabs.value = null

    const response = await loadUserTabs(userId)
    const { data, error, status } = response

    if (error) useErrorStore().setError({ error, customCode: status })

    if (data) tabs.value = data

    validateCache({ 
      ref: tabs, 
      queryFn: () => toPromise(userTabsQuery(userId)),
      key: userId, 
      loaderFn: loadUserTabs 
    })
  }

  // Get all open tabs
  const getOpenTabs = async () => {
    tabs.value = null

    const response = await loadOpenTabs('open-tabs')
    const { data, error, status } = response

    if (error) useErrorStore().setError({ error, customCode: status })

    if (data) tabs.value = data

    validateCache({ 
      ref: tabs, 
      queryFn: () => toPromise(openTabsQuery()),
      key: 'open-tabs', 
      loaderFn: loadOpenTabs 
    })
  }

  // Get tab items
  const getTabItems = async (tabId: string) => {
    tabItems.value = null

    const response = await loadTabItems(tabId)
    const { data, error, status } = response

    if (error) useErrorStore().setError({ error, customCode: status })

    if (data) tabItems.value = data

    validateCache({ 
      ref: tabItems, 
      queryFn: () => toPromise(tabItemsQuery(tabId)),
      key: tabId, 
      loaderFn: loadTabItems 
    })
  }

  // Get tab splits
  const getTabSplits = async (tabId: string) => {
    tabSplits.value = null

    const response = await loadTabSplits(tabId)
    const { data, error, status } = response

    if (error) useErrorStore().setError({ error, customCode: status })

    if (data) {
      // Type assertion to handle potential type mismatches from Supabase
      tabSplits.value = data as TabSplits
    }

    validateCache({ 
      ref: tabSplits, 
      queryFn: () => toPromise(tabSplitsQuery(tabId)),
      key: tabId, 
      loaderFn: loadTabSplits 
    })
  }

  // Get tab payments
  const getTabPayments = async (tabId: string) => {
    tabPayments.value = null

    const response = await loadTabPayments(tabId)
    const { data, error, status } = response

    if (error) useErrorStore().setError({ error, customCode: status })

    if (data) {
      // Type assertion to handle potential type mismatches from Supabase
      tabPayments.value = data as TabPayments
    }

    validateCache({ 
      ref: tabPayments, 
      queryFn: () => toPromise(tabPaymentsQuery(tabId)),
      key: tabId, 
      loaderFn: loadTabPayments 
    })
  }

  // Create new tab
  const createTab = async (tabData: { user_id: string; bar_id: number; tab_number: string; special_notes?: string | null; status?: string; subtotal?: number; tax_amount?: number; total_before_tip?: number; tip_amount?: number; total_owed?: number }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error, status } = await createTabQuery(tabData as any)

    if (error) {
      useErrorStore().setError({ error, customCode: status })
      return null
    }

    // Clear cache to refetch
    loadTabs.delete('all-tabs')
    await getTabs()

    return data?.[0]?.id || null
  }

  // Update tab
  const updateTab = async (tabId: string | number, updates: Partial<Tab>) => {
    const { error, status } = await updateTabQuery(tabId, updates)

    if (error) {
      useErrorStore().setError({ error, customCode: status })
      return false
    }

    if (tab.value?.id === tabId) {
      await getTab(tabId.toString())
    }

    return true
  }

  // Add item to tab
  const addTabItem = async (itemData: { tab_id: number; menu_item_id: number; quantity: number; unit_price: number; item_total: number; special_instructions?: string | null }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error, status } = await addTabItemQuery(itemData as any)

    if (error) {
      useErrorStore().setError({ error, customCode: status })
      return null
    }

    if (itemData.tab_id) {
      loadTabItems.delete(itemData.tab_id.toString())
      await getTabItems(itemData.tab_id.toString())
    }

    return data?.[0]?.id || null
  }

  // Update tab item
  const updateTabItem = async (itemId: string | number, updates: Partial<TabItem>) => {
    const { error, status } = await updateTabItemQuery(itemId, updates)

    if (error) {
      useErrorStore().setError({ error, customCode: status })
      return false
    }

    // Refresh items
    if (tabItems.value && tabItems.value.length > 0) {
      const tabId = tabItems.value[0]?.tab_id
      if (tabId) {
        loadTabItems.delete(tabId.toString())
        await getTabItems(tabId.toString())
      }
    }

    return true
  }

  // Delete tab item
  const deleteTabItem = async (itemId: string | number, tabId: string | number) => {
    const { error, status } = await deleteTabItemQuery(itemId)

    if (error) {
      useErrorStore().setError({ error, customCode: status })
      return false
    }

    loadTabItems.delete(tabId.toString())
    await getTabItems(tabId.toString())

    return true
  }

  // Create tab split
  const createTabSplit = async (splitData: TabSplitInsert) => {
    const { data, error, status } = await createTabSplitQuery(splitData)

    if (error) {
      useErrorStore().setError({ error, customCode: status })
      return null
    }

    if (splitData.tab_id) {
      loadTabSplits.delete(splitData.tab_id.toString())
      await getTabSplits(splitData.tab_id.toString())
    }

    return data?.[0]?.id || null
  }

  // Update tab split
  const updateTabSplit = async (splitId: string | number, updates: Partial<TabSplit>) => {
    const { error, status } = await updateTabSplitQuery(splitId, updates)

    if (error) {
      useErrorStore().setError({ error, customCode: status })
      return false
    }

    // Refresh splits if we have them loaded
    if (tabSplits.value && tabSplits.value.length > 0) {
      const tabId = tabSplits.value[0]?.tab_id
      if (tabId) {
        loadTabSplits.delete(tabId.toString())
        await getTabSplits(tabId.toString())
      }
    }

    return true
  }

  // Create payment
  const createPayment = async (paymentData: { tab_id: number; amount_paid: number; payment_method: string; status?: string; split_id?: number | null; tip_added?: number | null }) => {
    const { data, error, status } = await createTabPaymentQuery(paymentData as any)

    if (error) {
      useErrorStore().setError({ error, customCode: status })
      return null
    }

    if (paymentData.tab_id) {
      loadTabPayments.delete(paymentData.tab_id.toString())
      await getTabPayments(paymentData.tab_id.toString())
    }

    return data?.[0]?.id || null
  }

  return {
    // State
    tabs,
    tab,
    tabItems,
    tabSplits,
    tabPayments,

    // Getters
    getTabs,
    getTab,
    getUserTabs,
    getOpenTabs,
    getTabItems,
    getTabSplits,
    getTabPayments,

    // Actions
    createTab,
    updateTab,
    addTabItem,
    updateTabItem,
    deleteTabItem,
    createTabSplit,
    updateTabSplit,
    createPayment
  }
})