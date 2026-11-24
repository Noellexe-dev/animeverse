import type { Profile } from '../types'
import { supabase } from './supabase'

/**
 * Trae perfiles sin depender de relaciones foráneas entre tablas.
 * En Supabase, `posts.user_id` y `anime_reviews.user_id` apuntan a `auth.users`,
 * no directamente a `profiles`, así que las consultas anidadas
 * `author:profiles(...)` pueden fallar silenciosamente. Consultamos aparte.
 */
export async function fetchProfiles(ids: string[]): Promise<Profile[]> {
  const unique = Array.from(new Set(ids)).filter(Boolean)
  if (!supabase || unique.length === 0) return []
  const { data } = await supabase.from('profiles').select('*').in('id', unique)
  return (data ?? []) as Profile[]
}
