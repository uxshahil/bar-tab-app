import type { QueryData } from "@supabase/supabase-js"
import type { barsQuery, barQuery } from "../queries/barQueries"

export type Bars = QueryData<typeof barsQuery>
export type Bar = QueryData<ReturnType<typeof barQuery>>