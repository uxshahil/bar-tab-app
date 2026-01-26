<script setup lang="ts">
const sheetOpen = defineModel<boolean>()
</script>

<template>
  <Sheet v-model:open="sheetOpen">
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Create new project</SheetTitle>
      </SheetHeader>
      <FormKit type="text" label="Project Name" name="projectName" />
      <SheetFooter>
        <Button type="submit"> Save changes </Button>
        <SheetClose as-child>
          <Button variant="outline"> Close </Button>
        </SheetClose>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
