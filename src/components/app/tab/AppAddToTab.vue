<script setup lang="ts">
import { useTabsStore } from '@/stores/loaders/tabs'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import type { Drink } from '@/services/supabase/types/drinkTypes'

const props = defineProps<{
  drink: Drink | null
}>()

const isOpen = defineModel<boolean>('open')

const tabsStore = useTabsStore()
const authStore = useAuthStore()
const { profile } = storeToRefs(authStore)
const { tabs: openTabs, tab: currentTab, tabSplits } = storeToRefs(tabsStore)

// State
const mode = ref<'select-tab' | 'configure-item'>('select-tab')
const quantity = ref(1)
const selectedSplitId = ref<number | null>(null)
const specialInstructions = ref('')
const showNewTabForm = ref(false)

// Reset state when sheet opens/closes or drink changes
watch(isOpen, (newVal) => {
  if (newVal) {
    // If we already have a current tab, default to configure mode
    if (currentTab.value) {
      mode.value = 'configure-item'
      // Load splits for the current tab
      tabsStore.getTabSplits(currentTab.value.id.toString())
    } else {
      mode.value = 'select-tab'
      tabsStore.getOpenTabs()
    }
    
    // Reset form fields
    quantity.value = 1
    selectedSplitId.value = null
    specialInstructions.value = ''
    showNewTabForm.value = false
  }
})

// Tab Selection Logic
const selectTab = async (tab: any) => {
  await tabsStore.getTab(tab.id.toString())
  await tabsStore.getTabSplits(tab.id.toString())
  mode.value = 'configure-item'
}

const generateTabNumber = async () => {
  // Fetch all tabs to find the latest one
  // Note: In a high-volume production app, this should be done via a DB function or specific query
  await tabsStore.getTabs()
  const allTabs = tabsStore.tabs || []
  
  const now = new Date()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const datePrefix = `TAB-${month}${day}` // TAB-MMDD
  
  // Find latest tab with this prefix
  const latestTab = allTabs.find(t => t.tab_number.startsWith(datePrefix))
  
  let nextSequence = 1
  if (latestTab) {
    const parts = latestTab.tab_number.split('-')
    if (parts.length === 3) {
      const lastSeq = parseInt(parts[2] as string, 10)
      if (!isNaN(lastSeq)) {
        nextSequence = lastSeq + 1
      }
    }
  }
  
  return `${datePrefix}-${nextSequence.toString().padStart(4, '0')}`
}

const createNewTab = async (formData: any) => {
  const tabNumber = formData.tab_number || await generateTabNumber()
  
  let notes = formData.special_notes || ''
  if (formData.user_id) {
    notes = `Customer: ${formData.user_id}\n${notes}`
  }

  const tabId = await tabsStore.createTab({
    user_id: profile.value?.id || '', // Still assign to staff member for now
    bar_id: 1,
    tab_number: tabNumber,
    special_notes: notes || null,
    status: 'open',
    subtotal: 0,
    tax_amount: 0,
    total_before_tip: 0,
    tip_amount: 0,
    total_owed: 0,
  })

  if (tabId) {
    await tabsStore.getTab(tabId.toString())
    await tabsStore.getTabSplits(tabId.toString())
    mode.value = 'configure-item'
  }
}

// Add Item Logic
const addToTab = async () => {
  if (!currentTab.value || !props.drink) return

  await tabsStore.addDrinkToTab({
    tabId: currentTab.value.id,
    drink: { 
      id: props.drink.id, 
      price: props.drink.price || 0, 
      name: props.drink.name 
    },
    quantity: quantity.value,
    specialInstructions: specialInstructions.value,
    splitId: selectedSplitId.value
  })

  isOpen.value = false
}

const splitOptions = computed(() => {
  if (!tabSplits.value?.length) return []
  return tabSplits.value.map(s => ({
    label: `Split ${s.split_number} (${s.status})`,
    value: s.id
  }))
})
</script>

<template>
  <Sheet v-model:open="isOpen">
    <SheetContent class="overflow-y-auto">
      <SheetHeader>
        <SheetTitle>Add to Tab</SheetTitle>
        <SheetDescription v-if="drink">
          Adding <span class="font-semibold text-primary">{{ drink.name }}</span>
        </SheetDescription>
      </SheetHeader>

      <div class="mt-6">
        <!-- MODE: Select Tab -->
        <div v-if="mode === 'select-tab'" class="space-y-4">
          <div class="flex gap-2 mb-4">
            <Button 
              variant="outline" 
              class="flex-1" 
              :class="{ 'bg-primary text-primary-foreground': !showNewTabForm }"
              @click="showNewTabForm = false"
            >
              Existing Tab
            </Button>
            <Button 
              variant="outline" 
              class="flex-1"
              :class="{ 'bg-primary text-primary-foreground': showNewTabForm }"
              @click="showNewTabForm = true"
            >
              New Tab
            </Button>
          </div>

          <!-- Existing Tabs List -->
          <div v-if="!showNewTabForm" class="space-y-2">
            <div v-if="openTabs?.length" class="space-y-2">
              <div
                v-for="tab in openTabs"
                :key="tab.id"
                @click="selectTab(tab)"
                class="p-3 border rounded cursor-pointer hover:bg-muted transition-colors"
              >
                <div class="flex justify-between items-center">
                  <span class="font-medium">{{ tab.tab_number }}</span>
                  <span class="text-sm font-bold">R{{ tab.total_owed.toFixed(2) }}</span>
                </div>
                <div class="text-xs text-muted-foreground mt-1">
                  Created: {{ new Date(tab.created_at).toLocaleTimeString() }}
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-muted-foreground">
              No open tabs found.
            </div>
          </div>

          <!-- New Tab Form -->
          <div v-else>
            <FormKit
              type="form"
              @submit="createNewTab"
              submit-label="Create & Select"
              :value="{ tab_number: '', user_id: '' }"
            >
              <FormKit 
                type="text" 
                name="tab_number" 
                label="Tab Number" 
                placeholder="Auto-generated (TAB-MMDD-XXXX)" 
              />
              <FormKit 
                type="text" 
                name="user_id" 
                label="Customer Name / ID" 
                placeholder="Enter customer name" 
              />
              <FormKit type="textarea" name="special_notes" label="Special Notes" />
            </FormKit>
          </div>
        </div>

        <!-- MODE: Configure Item -->
        <div v-else class="space-y-6">
          <div class="bg-muted p-3 rounded-lg flex justify-between items-center">
            <div>
              <p class="text-xs text-muted-foreground">Selected Tab</p>
              <p class="font-semibold">{{ currentTab?.tab_number }}</p>
            </div>
            <Button variant="ghost" size="sm" @click="mode = 'select-tab'">Change</Button>
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between border p-4 rounded-lg">
              <span class="font-medium">{{ drink?.name }}</span>
              <span class="font-bold">R{{ drink?.price?.toFixed(2) }}</span>
            </div>

            <div class="grid gap-4">
              <div class="space-y-2">
                <label class="text-sm font-medium">Quantity</label>
                <div class="flex items-center gap-3">
                  <Button variant="outline" size="icon" @click="quantity = Math.max(1, quantity - 1)">
                    <iconify-icon icon="lucide:minus" />
                  </Button>
                  <span class="text-xl font-bold w-8 text-center">{{ quantity }}</span>
                  <Button variant="outline" size="icon" @click="quantity++">
                    <iconify-icon icon="lucide:plus" />
                  </Button>
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium">Assign to Split (Optional)</label>
                <select 
                  v-model="selectedSplitId"
                  class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option :value="null">None (Shared / Main Bill)</option>
                  <option v-for="split in splitOptions" :key="split.value" :value="split.value">
                    {{ split.label }}
                  </option>
                </select>
                <p class="text-xs text-muted-foreground">
                  If selected, this item will be assigned to a specific bill split.
                </p>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium">Special Instructions</label>
                <textarea 
                  v-model="specialInstructions"
                  class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="e.g. No ice, extra lemon..."
                ></textarea>
              </div>
            </div>

            <div class="pt-4">
              <Button class="w-full" size="lg" @click="addToTab">
                Add to Tab - R{{ (quantity * (drink?.price || 0)).toFixed(2) }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
