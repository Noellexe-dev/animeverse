import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// La Project URL y la publishable key son datos públicos por diseño.
// Se escriben aquí directamente para no depender de secretos del workflow.
const url = 'https://ewvqsovfnokdsatadaud.supabase.co'
const anonKey = 'sb_publishable_APhkPRS3PRTuSQTx9Lm9uA_yRq2-ILl'

/**
 * La clave `anon` de Supabase es pública por diseño: está pensada para usarse
 * en el navegador. La seguridad real se controla con Row Level Security.
 * Si no hay configuración, la aplicación sigue funcionando en modo local.
 */
export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, anonKey)
  : null

