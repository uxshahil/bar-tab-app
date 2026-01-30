<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import type { CreateNewDrink, EditDrink } from '@/interfaces/DrinkInterfaces'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import drinkApi from '@/services/api/drinkApi'
import { useDrinksStore } from '@/stores/loaders/drinks'

const props = defineProps<{
  drinkId?: number | null
}>()

const sheetOpen = defineModel<boolean>('open')
const emit = defineEmits(['close'])

const store = useDrinksStore()
const { getDrinks, getDrink } = store
const { drinks, drink } = storeToRefs(store)

// Reactively find the drink in the store to ensure we have the latest version (e.g. after SWR update)
const drinkToEdit = computed(() => {
    if (!props.drinkId) return null
    // Try finding in the list first
    const fromList = drinks.value?.find(d => String(d.id) === String(props.drinkId))
    if (fromList) return fromList

    // Fallback to the singular drink in store if IDs match
    if (drink.value && String(drink.value.id) === String(props.drinkId)) {
        return drink.value
    }
    
    return null
})

// Fetch drink if we don't have it (or if we want to ensure freshness via SWR)
watch(() => props.drinkId, async (newId) => {
    if (newId && !drinkToEdit.value) {
        await getDrink(String(newId))
    } else if (newId) {
        // Even if we have it, we might want to trigger a background SWR check 
        // to ensure the edit form is fresh.
        // store.getDrink handles SWR if we call it.
        // Let's call it to trigger the polling/healing!
        getDrink(String(newId))
    }
}, { immediate: true })

const isEditing = computed(() => !!props.drinkId)

type SelectOption = { label: string; value: number | string }

const selectOptions = ref({
  categories: [] as SelectOption[],
  glasses: [] as SelectOption[],
  alcoholic: [
    { label: 'Alcoholic', value: true },
    { label: 'Non-Alcoholic', value: false },
  ] as unknown as SelectOption[],
})

const formData = ref<Partial<CreateNewDrink>>({})

// Watch for drinkToEdit changes to populate form
watch(
  () => drinkToEdit.value,
  (newDrink) => {

    if (newDrink) {
      formData.value = {
        name: newDrink.name,
        slug: newDrink.slug,
        category: newDrink.category.name,
        alcoholic: newDrink.alcoholic,
        glass: newDrink.glass,
        instructions: newDrink.instructions || '',
        thumb_url: newDrink.thumb_url,
        ingredients: (newDrink.ingredients || []).join(', ') as unknown as string[],
        measurements: (newDrink.measurements || []).join(', ') as unknown as string[],
        price: newDrink.price
      }
    } else {
        // Reset form for create mode
        formData.value = {}
    }
  },
  { immediate: true }
)

const handleSubmit = async (fields: any) => {
  const drinkData = {
    ...fields,
    measurements: fields.measurements
        ? String(fields.measurements).split(',').map((m: string) => m.trim())
        : [],
    ingredients: fields.ingredients
        ? String(fields.ingredients).split(',').map((i: string) => i.trim())
        : [],
    active: true,
    last_modified: new Date(),
  }

  try {
    if (isEditing.value && props.drinkId) {
        // Call API to edit
        const editPayload: EditDrink = {
            id: props.drinkId,
            data: drinkData
        }
        await drinkApi.editDrink(editPayload)
        
        // Refresh the list immediately
        await getDrinks()
        
        // Trigger polling for 3s+ to catch any potential SWR/backend async updates
        store.pollForUpdates(String(props.drinkId))
        
    } else {
        const response = await drinkApi.createDrink(drinkData)
        await getDrinks()
        
        if (response && response.drinkId) {
             store.pollForUpdates(String(response.drinkId))
        }
    }
    sheetOpen.value = false
    emit('close')
  } catch (error) {
    console.error('Error saving drink:', error)
  }
}
</script>

<template>
  <Sheet v-model:open="sheetOpen">
    <SheetContent class="overflow-y-auto max-h-screen">
      <SheetHeader>
        <SheetTitle>{{ isEditing ? 'Edit Drink' : 'Create New Drink' }}</SheetTitle>
        <SheetDescription>
          {{ isEditing ? 'Make changes to the drink details below.' : 'Add a new drink to the menu.' }}
        </SheetDescription>
      </SheetHeader>

      <div v-if="isEditing && !drinkToEdit" class="flex justify-center items-center py-10">
         <iconify-icon icon="lucide:loader-circle" class="text-4xl animate-spin text-muted-foreground" />
      </div>

      <FormKit
        v-else
        type="form"
        :key="drinkId || 'new'"
        @submit="handleSubmit"
        :submit-label="isEditing ? 'Save Changes' : 'Create Drink'"
        :value="formData"
        :config="{
          validationVisibility: 'submit',
        }"
      >
        <FormKit
          type="text"
          name="name"
          label="Drink Name"
          placeholder="Enter drink name"
          validation="required|length:1,255"
        />
        <FormKit
          type="text"
          name="slug"
          label="Slug"
          placeholder="url-friendly-name"
          validation="required|length:1,255"
        />
        <FormKit
          type="text"
          name="category"
          label="Category"
          placeholder="Enter category"
          validation="required|length:1,100"
        />
        <FormKit
          type="select"
          name="alcoholic"
          label="Type"
          placeholder="Select type"
          :options="selectOptions.alcoholic"
        />
        <FormKit
          type="text"
          name="glass"
          label="Glass Type"
          placeholder="e.g., Cocktail Glass"
          validation="length:0,100"
        />
        <FormKit
          type="textarea"
          name="instructions"
          label="Instructions"
          placeholder="Enter preparation instructions"
          validation="length:0,1000"
        />
        <FormKit
          type="url"
          name="thumb_url"
          label="Image URL"
          placeholder="Enter image URL"
          validation="required|url"
        />
        <FormKit
          type="text"
          name="ingredients"
          label="Ingredients (comma-separated)"
          placeholder="Enter ingredients separated by commas"
          validation="length:0,1000"
        />
        <FormKit
          type="text"
          name="measurements"
          label="Measurements (comma-separated)"
          placeholder="Enter measurements separated by commas"
          validation="length:0,1000"
        />
        <FormKit
          type="number"
          name="price"
          label="Price"
          placeholder="Enter price"
          step="0.01"
          min="0"
        />
      </FormKit>
    </SheetContent>
  </Sheet>
</template>
