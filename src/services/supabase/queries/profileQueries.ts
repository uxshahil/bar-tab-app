import { supabase } from '@/providers/supabaseClient'
import { type Profile } from '../types/profileTypes';

export const profileQuery = ({ column, value }: { column: string; value: string }) => supabase
  .from('profile')
  .select('*')
  .eq(column, value)
  .single()

export const profilesQuery = () => supabase
  .from('profile')
  .select('*')


export const updateUserQuery = (updatedUser = {} as Partial<Profile>, id: string) => supabase
  .from('profile')
  .update(updatedUser)
  .eq('id', id)

