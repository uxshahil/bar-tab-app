import { supabase } from '@/providers/supabaseClient'
import type { QueryData } from '@supabase/supabase-js'

export const profileQuery = ({ column, value }: { column: string; value: string }) =>
  supabase.from('profile').select('*').eq(column, value).single()

export type Profile = QueryData<ReturnType<typeof profileQuery>>

export const profilesQuery = supabase.from('profile').select(`id, full_name`)

export const groupedProfilesQuery = (userIds: string[]) =>
  supabase.from('profile').select('username, avatar_url, id, full_name').in('id', userIds)
export type Collabs = QueryData<ReturnType<typeof groupedProfilesQuery>>

export const barsQuery = supabase.from('bar').select('*')
export type Bars = QueryData<typeof barsQuery>
export const barQuery = (slug: string) => supabase.from('bar').select(`*`).eq('slug', slug).single()
export type Bar = QueryData<ReturnType<typeof barQuery>>

export const menusQuery = supabase.from('menu').select('*')
export type Menus = QueryData<typeof menusQuery>
export const menuQuery = (slug: string) =>
  supabase.from('menu').select(`*`).eq('slug', slug).single()
export type Menu = QueryData<ReturnType<typeof menuQuery>>

export const menusWithCategoriesQuery = supabase
  .from('menu')
  .select('*,menu_item_category (id, name, slug)')
export type MenusWithCategories = QueryData<typeof menusWithCategoriesQuery>

export const drinksQuery = supabase
  .from('menu_item')
  .select('id, name, slug, price, category (name, slug, menu (name, slug))')
export type Drinks = QueryData<typeof drinksQuery>
export const drinkQuery = (id: number) =>
  supabase.from('menu_item').select(`*`).eq('id', id).single()
export type Drink = QueryData<ReturnType<typeof drinkQuery>>

// export const tasksWithProjectsQuery = supabase.from('tasks').select(`
//     *,
//     projects (
//       id,
//       name,
//       slug
//     )
//   `)

// export type TasksWithProjects = QueryData<typeof tasksWithProjectsQuery>

// export const projectsQuery = supabase.from('projects').select('*')

// export type Projects = QueryData<typeof projectsQuery>

// export const projectQuery = (slug: string) =>
//   supabase
//     .from('projects')
//     .select(`*, tasks (id, name, status, due_date)`)
//     .eq('slug', slug)
//     .single()

// export type Project = QueryData<ReturnType<typeof projectQuery>>

// export const taskQuery = (id: number) =>
//   supabase.from('tasks').select('*, projects(id,name,slug)').eq('id', id).single()

// export type Task = QueryData<ReturnType<typeof taskQuery>>
