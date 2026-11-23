import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = https://supabase.com/dashboard/project/ewvqsovfnokdsatadaud/sql/8788310c-bc75-439c-a60f-e9ab58a2420a
const anonKey = sb_publishable_APhkPRS3PRTuSQTx9Lm9uA_yRq2-ILl
/**
 * La clave `anon` de Supabase es pública por diseño: está pensada para usarse
 * en el navegador. La seguridad real se controla con Row Level Security.
 * Si no hay configuración, la aplicación sigue funcionando en modo local.
 */
export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null
