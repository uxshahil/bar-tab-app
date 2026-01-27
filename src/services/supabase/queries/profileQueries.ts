import { supabase } from '@/providers/supabaseClient'
import { type Profile } from '../types/profileTypes';
import { type CreateNewUser } from '../../../interfaces/UserInterfaces'

export const profileQuery = ({ column, value }: { column: string; value: string }) => supabase
  .from('profile')
  .select('*')
  .eq(column, value)
  .single()

export const profilesQuery = () => (supabase
  .from('profile')
  .select(`id, username, full_name, user_role`)
)

export const updateUserQuery = (updatedUser = {} as Partial<Profile>, id: string) => supabase
  .from('profile')
  .update(updatedUser)
  .eq('id', id)

export const groupedProfilesQuery = (userIds: string[]) => supabase
  .from('profile')
  .select('username, avatar_url, id, full_name')
  .in('id', userIds)

export const createNewUserQuery = async (newUser: CreateNewUser) => {
  const firstName = newUser.firstName
  const lastName = newUser.lastName
  const userName = newUser.username
  const email = newUser.email
  const password = newUser.password
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: firstName + ' ' + lastName,
        username: userName
      }
    }
  })

  if (data) {
    const userId = data?.user?.id
    const resp = await supabase.from('profile').insert({
      id: userId,
      full_name: firstName + ' ' + lastName,
      username: userName,
      bio: 'The main testing account',
      avatar_url: `https://i.pravatar.cc/150?u=${data.user.id}`,
      email: email,
      password: newUser.user_role !== 'admin' ? newUser.password : '',
      user_role: newUser.user_role,
      pin: newUser.pin
    })

    console.log(resp)
    return userId
  }
  return {error: 'error creating user'}
}
