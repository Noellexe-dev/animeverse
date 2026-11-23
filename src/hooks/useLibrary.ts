import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { LibraryItem, LibraryStatus } from '../types'

export function useLibrary(userId?: string) {
  const { user } = useAuth()
  const [items, setItems] = useState<LibraryItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    const target = userId ?? user?.id
    if (!target) {
      setItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase.from('anime_library').select('*').eq('user_id', target)
    setItems((data ?? []) as LibraryItem[])
    setLoading(false)
  }, [userId, user?.id])

  useEffect(() => {
    void load()
  }, [load])

  const setAnimeStatus = useCallback(async (animeId: string, status: LibraryStatus, rating?: number | null): Promise<string | null> => {
    if (!supabase || !user) return 'Inicia sesión para guardar en tu perfil.'
    const existing = items.find((item) => item.anime_id === animeId)
    if (existing?.status === status && (rating === undefined || existing.rating === rating)) {
      const { error } = await supabase
        .from('anime_library')
        .delete()
        .eq('user_id', user.id)
        .eq('anime_id', animeId)
      if (error) return error.message
      await load()
      return null
    }
    const { error } = await supabase.from('anime_library').upsert(
      {
        user_id: user.id,
        anime_id: animeId,
        status,
        rating: rating ?? existing?.rating ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,anime_id' },
    )
    if (error) return error.message
    await load()
    return null
  }, [user, items, load])

  const setRating = useCallback(async (animeId: string, rating: number | null): Promise<string | null> => {
    if (!supabase || !user) return 'Inicia sesión para puntuar.'
    const { error } = await supabase
      .from('anime_library')
      .update({ rating, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('anime_id', animeId)
    if (error) return error.message
    await load()
    return null
  }, [user, load])

  return { items, loading, setAnimeStatus, setRating, reload: load }
}
