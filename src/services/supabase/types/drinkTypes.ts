import type { QueryData } from "@supabase/supabase-js"
import type { drinksQuery, drinkQuery } from "../queries/drinkQueries"

export type Drinks = QueryData<typeof drinksQuery>
export type Drink = QueryData<ReturnType<typeof drinkQuery>>