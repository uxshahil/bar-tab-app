<script setup lang="ts">
import { useTabsStore } from '@/stores/loaders/tabs'

interface Props {
  tabId: number
}

interface Emits {
  (e: 'added'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const tabsStore = useTabsStore()

const formData = ref({
  quantity: 1,
  unit_price: 0,
  special_instructions: '',
})

const availableItems = ref([
  { id: 1, name: 'Beer', price: 35.0 },
  { id: 2, name: 'Wine', price: 50.0 },
  { id: 3, name: 'Cocktail', price: 65.0 },
  { id: 4, name: 'Soft Drink', price: 20.0 },
])

const selectedItem = ref<number | null>(null)

const itemTotal = computed(() => {
  return formData.value.quantity * formData.value.unit_price
})

const addItem = async () => {
  if (!selectedItem.value) {
    console.error('Please select an item')
    return
  }

  try {
    await tabsStore.addTabItem({
      tab_id: props.tabId,
      menu_item_id: selectedItem.value,
      quantity: formData.value.quantity,
      unit_price: formData.value.unit_price,
      item_total: itemTotal.value,
      special_instructions: formData.value.special_instructions || null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)

    emit('added')
  } catch (error) {
    console.error('Error adding item:', error)
  }
}

const handleItemSelect = (itemId: number) => {
  const item = availableItems.value.find((i) => i.id === itemId)
  if (item) {
    selectedItem.value = itemId
    formData.value.unit_price = item.price
  }
}
</script>

<template>
  <Dialog open @update:open="!$event && $emit('added')">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Item to Tab</DialogTitle>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <!-- Item Selection -->
        <div class="space-y-2">
          <label class="text-sm font-medium">Select Item</label>
          <select
            :value="selectedItem"
            @change="handleItemSelect(Number(($event.target as HTMLSelectElement).value))"
            class="w-full p-2 border rounded-md"
          >
            <option value="">-- Select Item --</option>
            <option v-for="item in availableItems" :key="item.id" :value="item.id">
              {{ item.name }} - R{{ item.price.toFixed(2) }}
            </option>
          </select>
        </div>

        <!-- Quantity -->
        <div class="space-y-2">
          <label class="text-sm font-medium">Quantity</label>
          <input
            v-model.number="formData.quantity"
            type="number"
            min="1"
            class="w-full p-2 border rounded-md"
          />
        </div>

        <!-- Unit Price -->
        <div class="space-y-2">
          <label class="text-sm font-medium">Unit Price</label>
          <input
            v-model.number="formData.unit_price"
            type="number"
            step="0.01"
            disabled
            class="w-full p-2 border rounded-md bg-muted"
          />
        </div>

        <!-- Item Total -->
        <div class="space-y-2">
          <label class="text-sm font-medium">Item Total</label>
          <input
            :value="itemTotal.toFixed(2)"
            type="text"
            disabled
            class="w-full p-2 border rounded-md bg-muted font-bold"
          />
        </div>

        <!-- Special Instructions -->
        <div class="space-y-2">
          <label class="text-sm font-medium">Special Instructions</label>
          <textarea
            v-model="formData.special_instructions"
            placeholder="e.g., Extra ice, No sugar, etc."
            class="w-full p-2 border rounded-md text-sm"
            rows="2"
          />
        </div>

        <!-- Actions -->
        <div class="flex gap-2 pt-4">
          <Button @click="addItem" class="flex-1">Add Item</Button>
          <DialogClose as-child>
            <Button variant="outline" class="flex-1">Cancel</Button>
          </DialogClose>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
