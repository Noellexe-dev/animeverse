import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { AnimeReview } from '../types'

interface ReviewRow {
  id: string
  user_id: string
  anime_id: string
  rating: number
  text: string
  created_at: string
  author?: AnimeReview['author']
}

export function useReviews(animeId: string) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<AnimeReview[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('anime_reviews')
      .select('*, author:profiles(id,username,display_name,avatar_url)')
      .eq('anime_id', animeId)
      .order('created_at', { ascending: false })
    setReviews(((data ?? []) as unknown as ReviewRow[]) as AnimeReview[])
    setLoading(false)
  }, [animeId])

  useEffect(() => {
    void load()
  }, [load])

  const saveReview = useCallback(async (rating: number, text: string): Promise<string | null> => {
    if (!supabase || !user) return 'Inicia sesión para opinar.'
    const clean = text.trim()
    if (!clean) return 'Escribe tu opinión.'
    const { error } = await supabase.from('anime_reviews').upsert(
      { user_id: user.id, anime_id: animeId, rating, text: clean, created_at: new Date().toISOString() },
      { onConflict: 'user_id,anime_id' },
    )
    if (error) return error.message
    await load()
    return null
  }, [user, animeId, load])

  const deleteReview = useCallback(async (): Promise<string | null> => {
    if (!supabase || !user) return 'Inicia sesión para borrar tu opinión.'
    const { error } = await supabase
      .from('anime_reviews')
      .delete()
      .eq('user_id', user.id)
      .eq('anime_id', animeId)
    if (error) return error.message
    await load()
    return null
  }, [user, animeId, load])

  const myReview = reviews.find((review) => review.user_id === user?.id) ?? null
  const average = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0

  return { reviews, loading, myReview, average, saveReview, deleteReview }
}
