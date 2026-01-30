<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { CreateNewUser, EditUser } from '@/interfaces/UserInterfaces'
import type { Profile } from '@/services/supabase/types/profileTypes'
import profileApi from '@/services/api/profileApi'


const props = defineProps<{
  userToEdit?: Profile | null
}>()

const sheetOpen = defineModel<boolean>('open')
const emit = defineEmits(['close', 'refresh'])

const isEditing = computed(() => !!props.userToEdit)



type SelectOption = { label: string; value: number | string }

const selectOptions = ref({
  roles: [
    { label: 'Admin', value: 'admin' },
    { label: 'Bar Staff', value: 'bar-staff' },
    { label: 'Bar Manager', value: 'bar-manager' },
  ] as SelectOption[],
})

const formData = ref<Partial<CreateNewUser>>({})

// Watch for userToEdit changes to populate form
watch(
  () => props.userToEdit,
  (newUser) => {
    if (newUser) {
      // Split full name if possible
      const [first, ...last] = (newUser.full_name || '').split(' ')
      formData.value = {
        firstName: first || '',
        lastName: last.join(' ') || '',
        username: newUser.username,
        email: newUser.email,
        password: '', // Password usually blank on edit unless changing
        pin: newUser.pin ? String(newUser.pin) : '',
        user_role: newUser.user_role as 'admin' | 'bar-staff' | 'bar-manager',
        bio: newUser.bio || '',
        avatar_url: newUser.avatar_url || ''
      }
    } else {
        // Reset form for create mode
        formData.value = {}
    }
  },
  { immediate: true }
)

const handleSubmit = async (fields: any) => {
  const userData = {
    ...fields,
    full_name: `${fields.firstName} ${fields.lastName}`,
    // Ensure numeric pin
    pin: Number(fields.pin)
  }

  try {
    if (isEditing.value && props.userToEdit) {
        console.log('Updating user:', props.userToEdit.id)
        
        // Only include password if provided
        if (!userData.password) delete userData.password
        
        // Sanitize data for profile table (remove non-columns)
        const { firstName, lastName, ...cleanData } = userData
        
        const editPayload: EditUser = {
            id: props.userToEdit.id,
            data: cleanData
        }
        await profileApi.editProfile(editPayload)
        emit('refresh')
    } else {
        console.log('Creating user')
        await profileApi.createProfile(userData as CreateNewUser)
        emit('refresh')
    }
    sheetOpen.value = false
    emit('close')
  } catch (error) {
    console.error('Error saving user:', error)
  }
}
</script>

<template>
  <Sheet v-model:open="sheetOpen">
    <SheetContent class="overflow-y-auto max-h-screen px-4">
      <SheetHeader>
        <SheetTitle>{{ isEditing ? 'Edit User' : 'Create New User' }}</SheetTitle>
      </SheetHeader>

      <FormKit
        type="form"
        @submit="handleSubmit"
        :submit-label="isEditing ? 'Save Changes' : 'Create User'"
        :value="formData"
        :config="{
          validationVisibility: 'submit',
        }"
      >
        <FormKit
          type="text"
          name="firstName"
          label="First Name"
          placeholder="Enter first name"
          validation="required|length:1,255"
        />
        <FormKit
          type="text"
          name="lastName"
          label="Last Name"
          placeholder="Enter last name"
          validation="required|length:1,255"
        />
        <FormKit
          type="text"
          name="username"
          label="Username"
          placeholder="Enter username"
          validation="required|length:1,255"
        />
        <FormKit
          type="email"
          name="email"
          label="Email"
          placeholder="Enter email"
          validation="required|email"
          :disabled="isEditing" 
        />
        <!-- On edit, password is optional -->
        <FormKit
          type="password"
          name="password"
          label="Password"
          placeholder="Enter password"
          :validation="isEditing ? 'length:8,255' : 'required|length:8,255'"
        />
        <FormKit
          type="text"
          name="pin"
          label="PIN"
          placeholder="Enter PIN"
          validation="required|number|length:4,4"
        />
        <FormKit
          type="select"
          name="user_role"
          label="Role"
          placeholder="Select role"
          :options="selectOptions.roles"
          validation="required"
        />
        <FormKit
          type="textarea"
          name="bio"
          label="Biography"
          placeholder="Enter bio"
          validation="length:0,500"
        />
        <FormKit
          type="url"
          name="avatar_url"
          label="Avatar URL"
          placeholder="Enter avatar URL"
        />
      </FormKit>
    </SheetContent>
  </Sheet>
</template>
