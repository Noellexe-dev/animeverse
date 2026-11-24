import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchProfiles } from '../lib/profiles'
import { supabase } from '../lib/supabase'
import type { AnimeReview, Profile } from '../types'

function withAuthors(rows: AnimeReview[], authors: Profile[]): AnimeReview[] {
  const map = new Map(authors.map((profile) => [profile.id, profile]))
  return rows.map((row) => ({ ...row, author: map.get(row.user_id) ?? null }))
}

export function useReviews(animeId: string) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<AnimeReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)

    const { data, error: selectError } = await supabase
      .from('anime_reviews')
      .select('*')
      .eq('anime_id', animeId)
      .order('created_at', { ascending: false })

    if (selectError) {
      setError(selectError.message)
      setReviews([])
      setLoading(false)
      return
    }

    const rows = (data ?? []) as AnimeReview[]
    const ids = Array.from(new Set(rows.map((row) => row.user_id)))
    let authors: Profile[] = []
    if (ids.length > 0) {
      authors = await fetchProfiles(ids)
    }
    setReviews(withAuthors(rows, authors))
    setLoading(false)
  }, [animeId])

  useEffect(() => {
    void load()
  }, [load])

  const saveReview = useCallback(async (rating: number, text: string): Promise<string | null> => {
    if (!supabase || !user) return 'Inicia sesión para opinar.'
    const clean = text.trim()
    const { error: upsertError } = await supabase.from('anime_reviews').upsert(
      { user_id: user.id, anime_id: animeId, rating, text: clean },
      { onConflict: 'user_id,anime_id' },
    )
    if (upsertError) return upsertError.message
    await load()
    return null
  }, [user, animeId, load])

  const deleteReview = useCallback(async (): Promise<string | null> => {
    if (!supabase || !user) return 'Inicia sesión para borrar tu opinión.'
    const { error: deleteError } = await supabase
      .from('anime_reviews')
      .delete()
      .eq('user_id', user.id)
      .eq('anime_id', animeId)
    if (deleteError) return deleteError.message
    await load()
    return null
  }, [user, animeId, load])

  const myReview = reviews.find((review) => review.user_id === user?.id) ?? null
  const average = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0

  return { reviews, loading, error, myReview, average, saveReview, deleteReview }
}

/**
 * Opiniones con estrellas para el muro social o para un perfil.
 * Si se pasan ids, solo se muestran esas cuentas; si no, se muestran todas.
 */
export function useReviewFeed(filterUserIds?: string[]) {
  const key = filterUserIds?.join(',') ?? ''
  const [reviews, setReviews] = useState<AnimeReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    if (filterUserIds && key === '') {
      setReviews([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)

    let query = supabase.from('anime_reviews').select('*').order('created_at', { ascending: false })
    if (filterUserIds) query = query.in('user_id', filterUserIds)
    const { data, error: selectError } = await query

    if (selectError) {
      setError(selectError.message)
      setReviews([])
      setLoading(false)
      return
    }

    const rows = (data ?? []) as AnimeReview[]
    const ids = Array.from(new Set(rows.map((row) => row.user_id)))
    let authors: Profile[] = []
    if (ids.length > 0) {
      authors = await fetchProfiles(ids)
    }
    setReviews(withAuthors(rows, authors))
    setLoading(false)
  }, [key])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const client = supabase
    if (!client) return
    const channel = client
      .channel(`animeverse-reviews-${key || 'all'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'anime_reviews' }, () => void load())
      .subscribe()
    return () => { void client.removeChannel(channel) }
  }, [load, key])

  return { reviews, loading, error, reload: load }
}
