import { profilesQuery as usersQuery, profileQuery as userQuery, updateUserQuery } from '@/services/supabase/queries/profileQueries'
import { useMemoize } from '@vueuse/core'
import type { Profile as User, Profiles as Users } from '@/services/supabase/types/profileTypes'
import type { EditUser } from '@/interfaces/UserInterfaces'

export const useUsersStore = defineStore('users-store', () => {
  const users = ref<Users | null>(null)
  const user = ref<User | null>(null)
  const userEdit = ref<User | null>(user.value)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadUsers = useMemoize(async (_key: string) => await usersQuery)
  const loadUser = useMemoize(async (id: string) => await userQuery({ column: 'id', value: id.toString() }))

  interface ValidateCacheParams {
    ref: typeof users | typeof user
    query: typeof usersQuery | typeof userQuery
    key: string
    loaderFn: typeof loadUsers | typeof loadUser
  }

  const validateCache = ({ ref, query, key, loaderFn }: ValidateCacheParams) => {
    if (ref.value) {
      const finalQuery = typeof query === 'function' ? query(key) : query

      finalQuery.then(({ data, error }) => {
        if (JSON.stringify(ref.value) === JSON.stringify(data)) {
          return
        } else {
          loaderFn.delete(key)
          if (!error && data) ref.value = data
        }
      })
    }
  }

  const getUsers = async () => {
    users.value = null

    const { data, error, status } = await loadUsers('users')

    if (error) useErrorStore().setError({ error, customCode: status })

    if (data) users.value = data

    validateCache({ ref: users, query: usersQuery, key: 'users', loaderFn: loadUsers })
  }

  const getUser = async (id: string) => {
    user.value = null

    const { data, error, status } = await loadUser(id)

    if (error) useErrorStore().setError({ error, customCode: status })

    if (data) user.value = data

    validateCache({ ref: user, query: userQuery, key: id.toString(), loaderFn: loadUser })
  }

  const updateUser = async (editUser: EditUser) => {
    // Validate user exists
    if (!user.value) return

    // Extract id and properties
    if (!editUser.id) return

    // Validate editUser input
    if (!editUser || typeof editUser !== 'object') return

    // Create merged user object with updated properties
    const updatedUser = {
      ...user.value,
      ...editUser
    }

    try {
      // Update user in database
      const { error } = await updateUserQuery(updatedUser, editUser.id)
      if (error) throw error

      // Update local user state
      user.value = updatedUser
      
      // Update userEdit ref
      userEdit.value = updatedUser

    } catch (error) {
      useErrorStore().setError({ 'error': error })
      return
    }
  }

  return {
    users,
    user,
    getUsers,
    getUser,
    updateUser
  }
})
