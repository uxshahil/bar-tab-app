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
  } else {
    console.error('Failed to save edit')
    // Optional: Show error toast
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

// Watch for tab changes to reload profile
watch(() => tab.value?.user_id, async (newUserId) => {
  if (newUserId) {
    await loadStaffProfile(newUserId)
  }
})
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

      <p v-if="tab.special_notes" class="text-sm mt-2 text-muted-foreground">
        Notes: {{ tab.special_notes }}
      </p>
    </div>

    <!-- Items Section -->
    <div class="space-y-3">
      <div class="flex justify-between items-center">
        <h3 class="font-semibold">Items</h3>
      </div>

      <div v-if="tabItems?.length" class="space-y-1 max-h-64 overflow-y-auto pr-1">
        <div
          v-for="item in [...tabItems].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())"
          :key="item.id"
          class="group relative text-sm py-2 px-1 border-b border-dashed border-muted-foreground/20 last:border-0 hover:bg-muted/30 transition-colors"
        >
          <!-- View Mode -->
          <div v-if="editingItemId !== item.id" class="flex justify-between items-start cursor-pointer" @click="startEditing(item)">
            <div class="flex gap-2 flex-1">
              <span class="font-bold min-w-[1.5rem]">{{ item.quantity }}x</span>
              <div class="flex flex-col">
                <div class="flex items-center gap-2">
                  <span class="font-medium leading-none">{{ item.menu_item?.name || `Item ${item.id}` }}</span>
                  <span class="text-[10px] text-muted-foreground font-mono whitespace-nowrap">
                    {{ getRelativeTime(item.created_at) }}
                  </span>
                </div>
                <span v-if="item.special_instructions" class="text-xs text-muted-foreground italic mt-0.5">
                  -- {{ item.special_instructions }}
                </span>
              </div>
            </div>
            <div class="text-right font-mono font-medium tabular-nums">
              {{ formatCurrency(item.item_total) }}
            </div>
          </div>

          <!-- Edit Mode -->
          <div v-else class="bg-muted/50 -mx-1 px-2 py-2 rounded-md space-y-2">
            <div class="flex items-center justify-between mb-2">
              <span class="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Edit Item</span>
              <div class="flex gap-1">
                <Button variant="ghost" size="icon" class="h-6 w-6" @click="cancelEditing">
                  <iconify-icon icon="lucide:x" class="text-xs" />
                </Button>
                <Button size="icon" class="h-6 w-6" @click="saveEdit(item)">
                  <iconify-icon icon="lucide:check" class="text-xs" />
                </Button>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <div class="flex items-center border rounded-md bg-background h-8">
                <button class="px-2 hover:bg-muted h-full border-r" @click="editForm.quantity = Math.max(1, editForm.quantity - 1)">-</button>
                <span class="w-8 text-center font-bold text-sm">{{ editForm.quantity }}</span>
                <button class="px-2 hover:bg-muted h-full border-l" @click="editForm.quantity++">+</button>
              </div>
              <input 
                v-model="editForm.specialInstructions"
                class="flex-1 h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="Add notes..."
                @keydown.enter="saveEdit(item)"
              />
            </div>
          </div>
        </div>
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
        <span class="font-medium">{{ formatCurrency(tab.subtotal) }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span>Tax (15%):</span>
        <span class="font-medium">{{ formatCurrency(tab.tax_amount) }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span>Total Before Tip:</span>
        <span class="font-medium">{{ formatCurrency(tab.total_before_tip) }}</span>
      </div>
      <div v-if="tab.tip_amount ?? 0 > 0" class="flex justify-between text-sm border-t pt-2 mt-2">
        <span>Tip:</span>
        <span class="font-medium text-green-600">+{{ formatCurrency(tab.tip_amount ?? 0) }}</span>
      </div>
      <div class="flex justify-between font-bold text-lg border-t pt-2 mt-2">
        <span>Total Owed:</span>
        <span>{{ formatCurrency(tab.total_owed) }}</span>
      </div>
    </div>

    <!-- Splits Section -->
    <div v-if="tabSplits?.length" class="border-t pt-4 space-y-3">
      <h3 class="font-semibold">Bill Splits</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="split in tabSplits" :key="split.id" class="p-3 bg-muted rounded text-sm">
          <p class="font-medium">Split {{ split.split_number }}</p>
          <div class="mt-2 space-y-1 text-xs">
            <div class="flex justify-between">
              <span>Amount Due:</span>
              <span>{{ formatCurrency(split.total_owed) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Amount Paid:</span>
              <span>{{ formatCurrency(split.amount_paid) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Status:</span>
              <span class="capitalize">{{ split.status }}</span>
            </div>
          </div>
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
