<script setup lang="ts">
import { useTabsStore } from '@/stores/loaders/tabs'
import { storeToRefs } from 'pinia'
import { profileQuery } from '@/services/supabase/queries/profileQueries'
import type { Profile } from '@/services/supabase/types/profileTypes'

const tabsStore = useTabsStore()
const { tab, tabItems, tabSplits, tabPayments } = storeToRefs(tabsStore)

interface Props {
  tabId: string | number
}

const props = defineProps<Props>()
const staffProfile = ref<Profile | null>(null)

// Editing State
const editingItemId = ref<number | null>(null)
const editForm = reactive({
  quantity: 1,
  specialInstructions: ''
})

const startEditing = (item: any) => {
  editingItemId.value = item.id
  editForm.quantity = Number(item.quantity) // Ensure number
  editForm.specialInstructions = item.special_instructions || ''
}

const cancelEditing = () => {
  editingItemId.value = null
}

const saveEdit = async (item: any) => {
  console.log('saveEdit called for item:', item.id, 'with form:', { ...editForm })
  const success = await tabsStore.updateDrinkInTab({
    tabId: Number(props.tabId),
    itemId: item.id,
    updates: {
      quantity: Number(editForm.quantity), // Ensure number
      specialInstructions: editForm.specialInstructions
    }
  })
  
  if (success) {
    editingItemId.value = null
    // Force re-fetch to ensure UI updates
    await tabsStore.getTabItems(props.tabId.toString())
  } else {
    console.error('Failed to save edit')
    // Optional: Show error toast
  }
}

// Watch for changes to debug reactivity
watch(() => tabItems.value, (newItems) => {
  console.log('tabItems updated in component:', newItems)
}, { deep: true })

// Description Editing
const isEditingDescription = ref(false)
const descriptionForm = ref('')

const startEditingDescription = () => {
  descriptionForm.value = tab.value?.special_notes || ''
  isEditingDescription.value = true
}

const cancelEditingDescription = () => {
  isEditingDescription.value = false
}

const saveDescription = async () => {
  if (!tab.value) return

  const success = await tabsStore.updateTab(tab.value.id, {
    special_notes: descriptionForm.value
  })

  if (success) {
    isEditingDescription.value = false
  }
}

// Expandable Notes Logic
const expandedNoteId = ref<number | null>(null)

const toggleNote = (itemId: number) => {
  if (expandedNoteId.value === itemId) {
    expandedNoteId.value = null
  } else {
    expandedNoteId.value = itemId
  }
}

const truncateNote = (text: string, length = 20) => {
  if (!text) return ''
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

const handleScroll = () => {
  if (expandedNoteId.value) {
    expandedNoteId.value = null
  }
}

// Computed Totals
const calculatedSubtotal = computed(() => {
  if (!tabItems.value) return 0
  return tabItems.value.reduce((sum, item) => sum + (Number(item.item_total) || 0), 0)
})

const calculatedTax = computed(() => {
  return calculatedSubtotal.value * 0.15
})

const calculatedTotalBeforeTip = computed(() => {
  return calculatedSubtotal.value + calculatedTax.value
})

const calculatedTotalOwed = computed(() => {
  return calculatedTotalBeforeTip.value + (Number(tab.value?.tip_amount) || 0)
})

const handleCheckout = async () => {
  if (!tab.value) return
  
  if (selectedSplitId.value) {
    // Handle Split Payment
    // For now, just log or show toast as this logic might need a payment flow
    console.log('Pay Split:', selectedSplitId.value, currentViewTotals.value)
    alert('Split payment flow to be implemented. Total: ' + formatCurrency(currentViewTotals.value.totalOwed))
    return
  }

  const success = await tabsStore.checkoutTab(tab.value.id, {
    subtotal: currentViewTotals.value.subtotal,
    tax_amount: currentViewTotals.value.tax,
    total_before_tip: currentViewTotals.value.totalBeforeTip,
    total_owed: currentViewTotals.value.totalOwed
  })

  if (success) {
    // Optional: Redirect or show success message
    // For now, the UI will update to show "Tab is closed"
  }
}

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(amount)
}

import { useNow } from '@vueuse/core'
const now = useNow()

const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now.value.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    if (diffInHours === 0) return 'Less than an hour ago' // Should be covered by minutes, but safe fallback
    return `${diffInHours} h ago`
  }
  
  return date.toLocaleDateString()
}

const loadStaffProfile = async (userId: string) => {
  const { data } = await profileQuery({ column: 'id', value: userId })
  if (data) staffProfile.value = data
}

onMounted(async () => {
  await tabsStore.getTab(props.tabId.toString())
  if (tab.value?.user_id) {
    await loadStaffProfile(tab.value.user_id)
  }
  await tabsStore.getTabItems(props.tabId.toString())
  await tabsStore.getTabSplits(props.tabId.toString())
  await tabsStore.getTabPayments(props.tabId.toString())
})

const getTabDuration = (dateString: string) => {
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now.value.getTime() - date.getTime()) / 1000)
  
  const hours = Math.floor(diffInSeconds / 3600)
  const minutes = Math.floor((diffInSeconds % 3600) / 60)
  const seconds = diffInSeconds % 60
  
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

import AppSplitBillSheet from '@/components/app/tab/AppSplitBillSheet.vue'

const isSplitBillOpen = ref(false)

// Split Logic
const selectedSplitId = ref<number | null>(null)

const getSplitItems = (splitId: number | null) => {
  if (!tabItems.value) return []
  if (!splitId) return tabItems.value

  const split = tabSplits.value?.find(s => s.id === splitId)
  if (!split) return []

  // Filter items that are in the split's items_included array
  // items_included is an array of string IDs
  return tabItems.value.filter(item => split.items_included?.includes(item.id.toString()))
}

const getUnassignedItems = () => {
  if (!tabItems.value) return []
  
  // Get all item IDs that are assigned to any split
  const assignedItemIds = new Set<string>()
  tabSplits.value?.forEach(split => {
    split.items_included?.forEach(id => assignedItemIds.add(id))
  })

  // Return items whose IDs are NOT in the assigned set
  return tabItems.value.filter(item => !assignedItemIds.has(item.id.toString()))
}

// Computed Totals based on View
const currentViewTotals = computed(() => {
  let itemsToSum = []
  
  if (selectedSplitId.value) {
    itemsToSum = getSplitItems(selectedSplitId.value)
  } else {
    itemsToSum = tabItems.value || []
  }

  const subtotal = itemsToSum.reduce((sum, item) => sum + (Number(item.item_total) || 0), 0)
  const tax = subtotal * 0.15
  const totalBeforeTip = subtotal + tax
  // If viewing a specific split, use its total_owed if available, otherwise calc
  // But for dynamic view, let's calc fresh
  const totalOwed = totalBeforeTip + (selectedSplitId.value === null ? (Number(tab.value?.tip_amount) || 0) : 0) // Only add main tip to main view for now

  return {
    subtotal,
    tax,
    totalBeforeTip,
    totalOwed
  }
})

// Watch for tab changes to reload profile
watch(() => tab.value?.user_id, async (newUserId) => {
  if (newUserId) {
    await loadStaffProfile(newUserId)
  }
})

// Update quantity helper
const updateQuantity = async (item: any, change: number) => {
  const newQuantity = Math.max(1, item.quantity + change)
  if (newQuantity === item.quantity) return

  await tabsStore.updateDrinkInTab({
    tabId: Number(props.tabId),
    itemId: item.id,
    updates: { quantity: newQuantity }
  })
}

import ItemRow from './ItemRow.vue'
</script>

<template>
  <div v-if="tab" class="space-y-6 p-4">
    <!-- Tab Header -->
    <div class="border-b pb-4">
      <div class="flex justify-between items-start">
        <div>
          <h2 class="text-2xl font-bold">{{ tab.tab_number }}</h2>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-sm text-muted-foreground">Status:</span>
            <span class="capitalize font-medium text-sm">{{ tab.status }}</span>
            <span class="text-muted-foreground mx-1">•</span>
            <iconify-icon icon="lucide:clock" class="text-muted-foreground text-xs" />
            <span class="font-mono text-sm font-medium">{{ getTabDuration(tab.created_at) }}</span>
          </div>
        </div>
        <div class="text-right space-y-2">
          <div class="flex justify-end gap-2">
            <Button variant="outline" size="sm" @click="isSplitBillOpen = true">
              <iconify-icon icon="lucide:split" class="mr-2 h-4 w-4" />
              Split Bill
            </Button>
          </div>
          <div class="text-xs text-muted-foreground">
            <p>Tab ID: {{ tab.id }}</p>
            <p>Created: {{ new Date(tab.created_at).toLocaleDateString() }}</p>
          </div>
        </div>
      </div>

      <AppSplitBillSheet 
        v-model:open="isSplitBillOpen"
        :tab-id="tab.id"
      />
      
      <!-- Staff Indicator -->
      <div v-if="staffProfile" class="mt-3 flex items-center gap-2 text-sm bg-muted/50 p-2 rounded">
        <iconify-icon icon="lucide:user" class="text-muted-foreground" />
        <span class="text-muted-foreground">Opened by:</span>
        <span class="font-medium">{{ staffProfile.full_name || staffProfile.username || 'Unknown' }}</span>
        <Badge variant="outline" class="text-[10px] h-5 ml-1 capitalize">
          {{ staffProfile.user_role?.replace('_', ' ') || 'Staff' }}
        </Badge>
      </div>

      <div class="mt-4">
        <div v-if="!isEditingDescription" class="group flex items-start gap-2">
          <div class="flex-1">
            <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description / Location</span>
            <p class="text-sm mt-1">
              {{ tab.special_notes || 'No description set' }}
            </p>
          </div>
          <Button variant="ghost" size="icon" class="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" @click="startEditingDescription">
            <iconify-icon icon="lucide:pencil" class="text-xs" />
          </Button>
        </div>

        <div v-else class="space-y-2">
           <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description / Location</span>
           <div class="flex gap-2">
             <textarea 
               v-model="descriptionForm"
               class="flex-1 min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
               placeholder="e.g., Table 5, Bar Seat"
             ></textarea>
             <div class="flex flex-col gap-1">
               <Button size="icon" class="h-8 w-8" @click="saveDescription">
                 <iconify-icon icon="lucide:check" class="text-sm" />
               </Button>
               <Button variant="ghost" size="icon" class="h-8 w-8" @click="cancelEditingDescription">
                 <iconify-icon icon="lucide:x" class="text-sm" />
               </Button>
             </div>
           </div>
        </div>
      </div>
    </div>

    <!-- Split Selector -->
    <div v-if="tabSplits?.length" class="flex items-center gap-1 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
      <Button 
        variant="outline" 
        size="sm" 
        class="h-7 px-2 text-xs font-bold min-w-[3rem]"
        :class="{ 'bg-primary text-primary-foreground hover:bg-primary/90': selectedSplitId === null }"
        @click="selectedSplitId = null"
      >
        ALL
      </Button>
      <Button
        v-for="split in tabSplits"
        :key="split.id"
        variant="outline"
        size="sm"
        class="h-7 px-2 text-xs font-bold min-w-[2.5rem]"
        :class="{ 'bg-primary text-primary-foreground hover:bg-primary/90': selectedSplitId === split.id }"
        @click="selectedSplitId = split.id"
      >
        S{{ split.split_number }}
      </Button>
      <Button variant="ghost" size="icon" class="h-7 w-7 shrink-0" @click="isSplitBillOpen = true">
        <iconify-icon icon="lucide:plus" class="text-base" />
      </Button>
    </div>

    <!-- Items Section -->
    <div class="space-y-3">
      <div class="flex justify-between items-center">
        <h3 class="font-semibold">
          {{ selectedSplitId ? `Split ${tabSplits?.find(s => s.id === selectedSplitId)?.split_number} Items` : 'All Items' }}
        </h3>
      </div>

      <div v-if="tabItems?.length" class="space-y-4 max-h-[60vh] overflow-y-auto pr-1" @scroll="handleScroll">
        <!-- Grouped View (All) -->
        <template v-if="selectedSplitId === null">
          <!-- Unassigned Items -->
          <div v-if="getUnassignedItems().length > 0">
            <h4 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 sticky top-0 bg-background z-10 py-1">
              Unassigned / Main Bill
            </h4>
            <div class="space-y-1">
              <div
                v-for="item in getUnassignedItems()"
                :key="item.id"
                class="group relative text-sm py-2 px-1 border-b border-dashed border-muted-foreground/20 last:border-0 hover:bg-muted/30 transition-colors"
              >
                <ItemRow 
                  :item="item" 
                  :editing-item-id="editingItemId"
                  :expanded-note-id="expandedNoteId"
                  :edit-form="editForm"
                  @start-editing="startEditing"
                  @cancel-editing="cancelEditing"
                  @save-edit="saveEdit"
                  @toggle-note="toggleNote"
                  @update-quantity="updateQuantity"
                />
              </div>
            </div>
          </div>

          <!-- Split Groups -->
          <div v-for="split in tabSplits" :key="split.id">
            <h4 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 sticky top-0 bg-background z-10 py-1 mt-4">
              Split {{ split.split_number }}
            </h4>
            <div class="space-y-1">
              <div
                v-for="item in getSplitItems(split.id)"
                :key="item.id"
                class="group relative text-sm py-2 px-1 border-b border-dashed border-muted-foreground/20 last:border-0 hover:bg-muted/30 transition-colors"
              >
                <ItemRow 
                  :item="item" 
                  :editing-item-id="editingItemId"
                  :expanded-note-id="expandedNoteId"
                  :edit-form="editForm"
                  @start-editing="startEditing"
                  @cancel-editing="cancelEditing"
                  @save-edit="saveEdit"
                  @toggle-note="toggleNote"
                  @update-quantity="updateQuantity"
                />
              </div>
              <div v-if="getSplitItems(split.id).length === 0" class="text-xs text-muted-foreground italic py-2">
                No items in this split
              </div>
            </div>
          </div>
        </template>

        <!-- Filtered View (Specific Split) -->
        <template v-else>
          <div class="space-y-1">
            <div
              v-for="item in getSplitItems(selectedSplitId)"
              :key="item.id"
              class="group relative text-sm py-2 px-1 border-b border-dashed border-muted-foreground/20 last:border-0 hover:bg-muted/30 transition-colors"
            >
              <ItemRow 
                :item="item" 
                :editing-item-id="editingItemId"
                :expanded-note-id="expandedNoteId"
                :edit-form="editForm"
                @start-editing="startEditing"
                @cancel-editing="cancelEditing"
                @save-edit="saveEdit"
                @toggle-note="toggleNote"
                @update-quantity="updateQuantity"
              />
            </div>
             <div v-if="getSplitItems(selectedSplitId).length === 0" class="text-center py-8 text-muted-foreground">
                <p>No items assigned to this split</p>
                <Button variant="link" size="sm" @click="isSplitBillOpen = true">Manage Splits</Button>
              </div>
          </div>
        </template>
      </div>
      <div v-else class="flex flex-col items-center justify-center py-8 text-muted-foreground opacity-50">
        <iconify-icon icon="lucide:receipt" class="text-3xl mb-2" />
        <p class="text-sm">No items yet</p>
      </div>
    </div>

    <!-- Totals Section -->
    <div class="border-t pt-4 space-y-2">
      <div class="flex justify-between text-sm">
        <span>Subtotal:</span>
        <span class="font-medium">{{ formatCurrency(currentViewTotals.subtotal) }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span>Tax (15%):</span>
        <span class="font-medium">{{ formatCurrency(currentViewTotals.tax) }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span>Total Before Tip:</span>
        <span class="font-medium">{{ formatCurrency(currentViewTotals.totalBeforeTip) }}</span>
      </div>
      <div v-if="(tab.tip_amount ?? 0) > 0 && selectedSplitId === null" class="flex justify-between text-sm border-t pt-2 mt-2">
        <span>Tip:</span>
        <span class="font-medium text-green-600">+{{ formatCurrency(tab.tip_amount ?? 0) }}</span>
      </div>
      <div class="flex justify-between font-bold text-lg border-t pt-2 mt-2">
        <span>Total Owed:</span>
        <span>{{ formatCurrency(currentViewTotals.totalOwed) }}</span>
      </div>

      <div class="pt-4">
        <Button 
          v-if="tab.status === 'open'"
          class="w-full" 
          size="lg" 
          @click="handleCheckout"
        >
          <iconify-icon icon="lucide:check-circle" class="mr-2" />
          {{ selectedSplitId ? `Pay Split ${tabSplits?.find(s => s.id === selectedSplitId)?.split_number}` : 'Checkout & Close Tab' }}
        </Button>
        <div v-else class="text-center p-2 bg-muted rounded text-sm font-medium text-muted-foreground">
          Tab is {{ tab.status }}
        </div>
      </div>
    </div>

    <!-- Payments Section -->
    <div v-if="tabPayments?.length" class="border-t pt-4 space-y-3">
      <h3 class="font-semibold">Payment History</h3>
      <div class="space-y-2 max-h-32 overflow-y-auto">
        <div v-for="payment in tabPayments" :key="payment.id" class="p-2 bg-muted rounded text-xs">
          <div class="flex justify-between">
            <span>{{ formatCurrency(payment.amount_paid) }} via {{ payment.payment_method }}</span>
            <span class="text-muted-foreground">
              {{ new Date(payment.created_at).toLocaleTimeString() }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
