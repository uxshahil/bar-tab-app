import type { QueryData } from "@supabase/supabase-js"
import type { profileQuery, profilesQuery, groupedProfilesQuery } from "../queries/profileQueries"

export type Profile = QueryData<ReturnType<typeof profileQuery>>
export type Profiles = QueryData<ReturnType<typeof profilesQuery>>
export type Collabs = QueryData<ReturnType<typeof groupedProfilesQuery>>