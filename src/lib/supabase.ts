import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * La clave `anon` de Supabase es pública por diseño: está pensada para usarse
 * en el navegador. La seguridad real se controla con Row Level Security.
 * Si no hay configuración, la aplicación sigue funcionando en modo local.
 */
export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null
