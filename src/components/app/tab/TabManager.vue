<template>
  <div class="space-y-4">
    <!-- Tab Actions -->
    <div class="flex gap-2">
      <Button @click="showNewTabSheet = true">New Tab</Button>
      <Button variant="outline" @click="showOpenTabSheet = true">Open Existing</Button>
    </div>

    <!-- Current Tab Display -->
    <div v-if="currentTab" class="border rounded-lg p-4">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h3 class="font-semibold">{{ currentTab.tab_number }}</h3>
          <p class="text-sm text-muted-foreground">Total: ${{ currentTab.total_owed.toFixed(2) }}</p>
        </div>
        <Button variant="outline" size="sm" @click="showAddItemSheet = true">Add Item</Button>
      </div>

      <!-- Tab Items -->
      <div v-if="tabItems?.length" class="space-y-2">
        <div v-for="item in tabItems" :key="item.id" class="flex justify-between items-center p-2 bg-muted rounded">
          <div>
            <span class="font-medium">Item #{{ item.menu_item_id }}</span>
            <span class="text-sm text-muted-foreground ml-2">x{{ item.quantity }}</span>
          </div>
          <span>${{ item.item_total.toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <!-- New Tab Sheet -->
    <Sheet v-model:open="showNewTabSheet">
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create New Tab</SheetTitle>
        </SheetHeader>
        <FormKit
          type="form"
          @submit="createNewTab"
          submit-label="Create Tab"
          :value="{ tab_number: generateTabNumber(), user_id: profile?.id || '' }"
        >
          <FormKit type="text" name="tab_number" label="Tab Number" disabled />
          <FormKit type="text" name="user_id" label="Assigned To" :value="profile?.full_name" disabled />
          <FormKit type="textarea" name="special_notes" label="Special Notes" />
        </FormKit>
      </SheetContent>
    </Sheet>

    <!-- Open Existing Tab Sheet -->
    <Sheet v-model:open="showOpenTabSheet">
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Open Existing Tab</SheetTitle>
        </SheetHeader>
        <div v-if="openTabs?.length" class="space-y-2">
          <div
            v-for="tab in openTabs"
            :key="tab.id"
            @click="selectTab(tab)"
            class="p-3 border rounded cursor-pointer hover:bg-muted"
          >
            <div class="font-medium">{{ tab.tab_number }}</div>
            <div class="text-sm text-muted-foreground">${{ tab.total_owed.toFixed(2) }}</div>
          </div>
        </div>
      </SheetContent>
    </Sheet>

    <!-- Add Item Sheet -->
    <Sheet v-model:open="showAddItemSheet">
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Item to Tab</SheetTitle>
        </SheetHeader>
        <FormKit
          type="form"
          @submit="addItemToTab"
          submit-label="Add Item"
        >
          <FormKit
            type="select"
            name="menu_item_id"
            label="Select Drink"
            :options="drinkOptions"
            validation="required"
          />
          <FormKit
            type="number"
            name="quantity"
            label="Quantity"
            :value="1"
            validation="required|min:1"
          />
          <FormKit
            type="number"
            name="unit_price"
            label="Price"
            step="0.01"
            validation="required|min:0"
          />
          <FormKit type="textarea" name="special_instructions" label="Special Instructions" />
        </FormKit>
      </SheetContent>
    </Sheet>
  </div>
</template>

<script setup lang="ts">
import { useTabsStore } from '@/stores/loaders/tabs'
import { useDrinksStore } from '@/stores/loaders/drinks'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import type { Tab } from '@/services/supabase/types/tabTypes'

const tabsStore = useTabsStore()
const drinksStore = useDrinksStore()
const authStore = useAuthStore()
const { profile } = storeToRefs(authStore)
const { tabs: openTabs, tab: currentTab, tabItems } = storeToRefs(tabsStore)
const { drinks } = storeToRefs(drinksStore)

const showNewTabSheet = ref(false)
const showOpenTabSheet = ref(false)
const showAddItemSheet = ref(false)

const generateTabNumber = () => {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `TAB-${timestamp}-${random}`
}

const drinkOptions = computed(() => 
  drinks.value?.map(drink => ({
    label: `${drink.name} - $${drink.price?.toFixed(2) || '0.00'}`,
    value: drink.id
  })) || []
)

const createNewTab = async (formData: any) => {
  const tabId = await tabsStore.createTab({
    user_id: formData.user_id,
    tab_number: formData.tab_number,
    special_notes: formData.special_notes || null,
    status: 'open',
    subtotal: 0,
    tax_amount: 0,
    total_before_tip: 0,
    tip_amount: 0,
    total_owed: 0,
  } as Partial<Tab>)

  if (tabId) {
    await tabsStore.getTab(tabId.toString())
    showNewTabSheet.value = false
  }
}

const selectTab = async (tab: any) => {
  await tabsStore.getTab(tab.id.toString())
  await tabsStore.getTabItems(tab.id.toString())
  showOpenTabSheet.value = false
}

const addItemToTab = async (formData: any) => {
  if (!currentTab.value) return

  const itemTotal = formData.quantity * formData.unit_price
  
  await tabsStore.addTabItem({
    tab_id: currentTab.value.id,
    menu_item_id: formData.menu_item_id,
    quantity: formData.quantity,
    unit_price: formData.unit_price,
    item_total: itemTotal,
    special_instructions: formData.special_instructions || null
  })

  // Update tab totals
  const newSubtotal = currentTab.value.subtotal + itemTotal
  const newTotal = newSubtotal + currentTab.value.tax_amount + currentTab.value.tip_amount

  await tabsStore.updateTab(currentTab.value.id, {
    subtotal: newSubtotal,
    total_before_tip: newSubtotal + currentTab.value.tax_amount,
    total_owed: newTotal
  })

  showAddItemSheet.value = false
}

// Load initial data
onMounted(async () => {
  await drinksStore.getDrinks()
  await tabsStore.getOpenTabs()
})
</script>
</template>