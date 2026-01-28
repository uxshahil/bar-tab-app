<script setup lang="ts">
import { useTabsStore } from '@/stores/loaders/tabs'
import { storeToRefs } from 'pinia'

const tabsStore = useTabsStore()
const { tab, tabItems, tabSplits, tabPayments } = storeToRefs(tabsStore)

interface Props {
  tabId: string | number
}

const props = defineProps<Props>()
const showAddItem = ref(false)

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(amount)
}

// Calculate tax (15% VAT)
const calculateTax = (subtotal: number) => {
  return subtotal * 0.15
}

onMounted(async () => {
  await tabsStore.getTab(props.tabId.toString())
  await tabsStore.getTabItems(props.tabId.toString())
  await tabsStore.getTabSplits(props.tabId.toString())
  await tabsStore.getTabPayments(props.tabId.toString())
})
</script>

<template>
  <div v-if="tab" class="space-y-6 p-4">
    <!-- Tab Header -->
    <div class="border-b pb-4">
      <div class="flex justify-between items-start">
        <div>
          <h2 class="text-2xl font-bold">{{ tab.tab_number }}</h2>
          <p class="text-sm text-muted-foreground">
            Status: <span class="capitalize font-medium">{{ tab.status }}</span>
          </p>
        </div>
        <div class="text-right">
          <p class="text-xs text-muted-foreground">Tab ID: {{ tab.id }}</p>
          <p class="text-xs text-muted-foreground">
            Created: {{ new Date(tab.created_at).toLocaleDateString() }}
          </p>
        </div>
      </div>
      <p v-if="tab.special_notes" class="text-sm mt-2 text-muted-foreground">
        Notes: {{ tab.special_notes }}
      </p>
    </div>

    <!-- Items Section -->
    <div class="space-y-3">
      <div class="flex justify-between items-center">
        <h3 class="font-semibold">Items</h3>
        <Button size="sm" @click="showAddItem = true" v-if="tab.status === 'open'">
          <iconify-icon icon="lucide:plus" class="mr-1" />
          Add Item
        </Button>
      </div>

      <div v-if="tabItems?.length" class="space-y-2 max-h-64 overflow-y-auto">
        <div
          v-for="item in tabItems"
          :key="item.id"
          class="flex justify-between items-start p-2 bg-muted rounded text-sm"
        >
          <div class="flex-1">
            <p class="font-medium">Item {{ item.id }}</p>
            <p v-if="item.special_instructions" class="text-xs text-muted-foreground">
              {{ item.special_instructions }}
            </p>
          </div>
          <div class="text-right">
            <p class="font-medium">{{ item.quantity }}x {{ formatCurrency(item.unit_price) }}</p>
            <p class="text-xs font-bold">{{ formatCurrency(item.item_total) }}</p>
          </div>
        </div>
      </div>
      <p v-else class="text-sm text-muted-foreground">No items yet</p>
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

    <!-- Add Item Modal -->
    <TabItemForm v-if="showAddItem" :tab-id="tab.id" @added="showAddItem = false" />
  </div>
</template>
