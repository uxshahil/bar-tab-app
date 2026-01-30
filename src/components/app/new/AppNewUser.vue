<script setup lang="ts">
import type { CreateNewUser } from '@/interfaces/UserInterfaces'
import profileApi from '@/services/api/profileApi'

const sheetOpen = defineModel<boolean>()

type SelectOption = { label: string; value: number | string }

const selectOptions = ref({
  profiles: [] as SelectOption[],
  roles: [
    { label: 'Admin', value: 'admin' },
    { label: 'Bar Staff', value: 'bar-staff' },
    { label: 'Bar Manager', value: 'bar-manager' },
  ] as SelectOption[],
})

const createUser = async (formData: CreateNewUser) => {
  const user = {
    ...formData,
    full_name: `${formData.firstName} ${formData.lastName}`,
    avatar_url: formData.avatar_url || '', // Default empty string if not provided
    bio: formData.bio || '', // Default empty string if not provided
  }

  const userId = (await profileRequests.createProfile(user)) ?? null

  if (userId === null) {
    console.log('error')
  }

  if (userId) {
    console.log('User created with ID:', userId)
  }

  sheetOpen.value = false
}
</script>

<template>
  <Sheet v-model:open="sheetOpen">
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Create new user</SheetTitle>
      </SheetHeader>

      <FormKit
        type="form"
        @submit="createUser"
        submit-label="Create User"
        :config="{
          validationVisibility: 'submit',
        }"
      >
        <FormKit
          type="text"
          name="firstName"
          id="firstName"
          label="First Name"
          placeholder="Enter first name"
          validation="required|length:1,255"
        />
        <FormKit
          type="text"
          name="lastName"
          id="lastName"
          label="Last Name"
          placeholder="Enter last name"
          validation="required|length:1,255"
        />
        <FormKit
          type="text"
          name="username"
          id="username"
          label="Username"
          placeholder="Enter username"
          validation="required|length:1,255"
        />
        <FormKit
          type="email"
          name="email"
          id="email"
          label="Email"
          placeholder="Enter email"
          validation="required|email"
        />
        <FormKit
          type="password"
          name="password"
          id="password"
          label="Password"
          placeholder="Enter password"
          validation="required|length:8,255"
        />
        <FormKit
          type="text"
          name="pin"
          id="pin"
          label="PIN"
          placeholder="Enter PIN"
          validation="required|number|length:4,4"
        />
        <FormKit
          type="select"
          name="user_role"
          id="user_role"
          label="Role"
          placeholder="Select role"
          :options="selectOptions.roles"
          validation="required"
        />
        <FormKit
          type="textarea"
          name="bio"
          id="bio"
          label="Biography"
          placeholder="Enter bio"
          validation="length:0,500"
        />
        <FormKit
          type="url"
          name="avatar_url"
          id="avatar_url"
          label="Avatar URL"
          placeholder="Enter avatar URL"
        />
      </FormKit>
    </SheetContent>
  </Sheet>
</template>
