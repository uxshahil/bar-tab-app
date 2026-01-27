<script setup lang="ts">
import type { CreateNewDrink } from '@/interfaces/DrinkInterfaces'
import drinkRequest from '@/services/supabase/requests/drinkRequests'

const sheetOpen = defineModel<boolean>()

type SelectOption = { label: string; value: number | string }

const selectOptions = ref({
  categories: [] as SelectOption[],
  glasses: [] as SelectOption[],
  alcoholic: [
    { label: 'Alcoholic', value: true },
    { label: 'Non-Alcoholic', value: false },
  ] as unknown as SelectOption[],
})

const handleCreateDrink = async (formData: Partial<CreateNewDrink>) => {
  const drink: Partial<CreateNewDrink> = {
    ...formData,
    measurements: formData.measurements
      ? String(formData.measurements)
          .split(',')
          .map((m) => m.trim())
      : [],
    ingredients: formData.ingredients
      ? String(formData.ingredients)
          .split(',')
          .map((i) => i.trim())
      : [],
    active: true,
    last_modified: new Date(),
  }

  try {
    console.log('Creating drink:', drink)

    const drinkId = drinkRequest.createDrink(drink)
    if (drinkId) {
      console.log('Drink created with ID:', await drinkId)
    }
  } catch (error) {
    console.error('Error creating drink:', error)
  }

  sheetOpen.value = false
}
</script>

<template>
  <Sheet v-model:open="sheetOpen">
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Create new drink</SheetTitle>
      </SheetHeader>

      <FormKit
        type="form"
        @submit="handleCreateDrink"
        submit-label="Create Drink"
        :config="{
          validationVisibility: 'submit',
        }"
      >
        <FormKit
          type="text"
          name="name"
          id="name"
          label="Drink Name"
          placeholder="Enter drink name"
          validation="required|length:1,255"
        />
        <FormKit
          type="text"
          name="slug"
          id="slug"
          label="Slug"
          placeholder="url-friendly-name"
          validation="required|length:1,255"
        />
        <FormKit
          type="text"
          name="category"
          id="category"
          label="Category"
          placeholder="Enter category"
          validation="required|length:1,100"
        />
        <FormKit
          type="select"
          name="alcoholic"
          id="alcoholic"
          label="Type"
          placeholder="Select type"
          :options="selectOptions.alcoholic"
        />
        <FormKit
          type="text"
          name="glass"
          id="glass"
          label="Glass Type"
          placeholder="e.g., Cocktail Glass, Shot Glass"
          validation="length:0,100"
        />
        <FormKit
          type="textarea"
          name="instructions"
          id="instructions"
          label="Instructions"
          placeholder="Enter preparation instructions"
          validation="length:0,1000"
        />
        <FormKit
          type="url"
          name="thumb_url"
          id="thumb_url"
          label="Image URL"
          placeholder="Enter image URL"
          validation="required|url"
        />
        <FormKit
          type="text"
          name="ingredients"
          id="ingredients"
          label="Ingredients (comma-separated)"
          placeholder="Enter ingredients separated by commas"
          validation="length:0,1000"
        />
        <FormKit
          type="text"
          name="measurements"
          id="measurements"
          label="Measurements (comma-separated)"
          placeholder="Enter measurements separated by commas"
          validation="length:0,1000"
        />
        <FormKit
          type="number"
          name="price"
          id="price"
          label="Price"
          placeholder="Enter price"
          step="0.01"
          min="0"
        />
      </FormKit>
    </SheetContent>
  </Sheet>
</template>
