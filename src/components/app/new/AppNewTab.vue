<script setup lang="ts">
import { useTabsStore } from '@/stores/loaders/tabs'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { Tab } from '@/services/supabase/types/tabTypes'

const sheetOpen = defineModel<boolean>()
const tabsStore = useTabsStore()
const authStore = useAuthStore()
const { profile } = storeToRefs(authStore)

// Generate unique tab number
const generateTabNumber = () => {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `TAB-${timestamp}-${random}`
}

const createTab = async (formData: Partial<Tab>) => {
  if (!formData.user_id || !formData.tab_number) return

  const tabId = await tabsStore.createTab({
    user_id: formData.user_id,
    bar_id: 1,
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
    sheetOpen.value = false
  }
}
</script>

<template>
  <Sheet v-model:open="sheetOpen">
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Create New Tab</SheetTitle>
      </SheetHeader>

      <FormKit
        type="form"
        @submit="createTab"
        submit-label="Create Tab"
        :config="{
          validationVisibility: 'submit',
        }"
        :value="{
          tab_number: generateTabNumber(),
          user_id: profile?.id || '',
          special_notes: '',
        }"
      >
        <FormKit
          type="text"
          name="tab_number"
          id="tab_number"
          label="Tab Number"
          placeholder="Auto-generated"
          disabled
        />

        <div class="space-y-1">
          <FormKit
            type="text"
            name="user_id"
            id="user_id"
            label="Assigned To"
            :placeholder="profile?.full_name || 'Current User'"
            disabled
          />
          <p class="text-xs text-muted-foreground pl-1">
            Tab assigned to: {{ profile?.full_name }}
          </p>
        </div>

        <FormKit
          type="textarea"
          name="special_notes"
          id="special_notes"
          label="Special Notes (Optional)"
          placeholder="e.g., VIP table, Private event"
          validation="length:0,500"
          :rows="3"
        />
      </FormKit>
    </SheetContent>
  </Sheet>
</template>
