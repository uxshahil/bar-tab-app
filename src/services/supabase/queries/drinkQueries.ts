import { supabase } from '@/providers/supabaseClient'

export const drinksQuery = supabase
  .from('menu_item')
  .select('id, name, slug, price, category (name, slug, menu (name, slug))')

export const drinkQuery = (slug: string) => supabase
  .from('menu_item')
  .select(`*`)
  .eq('slug', slug)
  .single()

export const updateDrinkQuery = (updatedDrink = {}, id: number) => supabase
  .from('menu_item')
  .update(updatedDrink)
  .eq('id', id)

export const deleteDrinkQuery = (id: number) => supabase
  .from('menu_item')
  .delete()
  .eq('id', id)
