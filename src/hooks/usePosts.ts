import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { Post } from '../types'
import { parseHashtags } from '../utils/format'

const PROFILE_FIELDS = 'id,username,display_name,avatar_url,is_public'

interface PostRow {
  id: string
  user_id: string
  anime_id: string | null
  text: string | null
  image_url: string | null
  created_at: string
  author?: Post['author']
  comments?: Post['comments']
  likes?: { user_id: string }[]
}

function normalize(row: PostRow, myId: string | null): Post {
  return {
    id: row.id,
    user_id: row.user_id,
    anime_id: row.anime_id,
    text: row.text,
    image_url: row.image_url,
    created_at: row.created_at,
    author: row.author ?? null,
    comments: row.comments ?? [],
    like_count: row.likes?.length ?? 0,
    liked_by_me: Boolean(myId && row.likes?.some((like) => like.user_id === myId)),
  }
}

export interface NewPostInput {
  text: string
  image: File | null
  animeId?: string | null
}

export function usePosts(mode: 'feed' | 'anime' | 'profile' = 'feed', targetId?: string) {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)

    if ((mode === 'anime' || mode === 'profile') && !targetId) {
      setPosts([])
      setLoading(false)
      return
    }

    let query = supabase
      .from('posts')
      .select(`*, author:profiles(${PROFILE_FIELDS}), comments(*, author:profiles(${PROFILE_FIELDS})), likes(user_id)`)
      .order('created_at', { ascending: false })

    if (mode === 'anime' && targetId) {
      query = query.eq('anime_id', targetId)
    } else if (mode === 'profile' && targetId) {
      query = query.eq('user_id', targetId)
    } else if (mode === 'feed') {
      if (!user) {
        setPosts([])
        setLoading(false)
        return
      }
      const { data: following } = await supabase.from('follows').select('following_id').eq('follower_id', user.id)
      const { data: followers } = await supabase.from('follows').select('follower_id').eq('following_id', user.id)
      const ids = Array.from(new Set([
        ...(following ?? []).map((row) => row.following_id as string),
        ...(followers ?? []).map((row) => row.follower_id as string),
      ]))
      if (ids.length === 0) {
        setPosts([])
        setLoading(false)
        return
      }
      query = query.in('user_id', ids)
    }

    const { data, error: queryError } = await query
    if (queryError) {
      setError(queryError.message)
      setLoading(false)
      return
    }
    setPosts(((data ?? []) as unknown as PostRow[]).map((row) => normalize(row, user?.id ?? null)))
    setLoading(false)
  }, [mode, targetId, user?.id])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const client = supabase
    if (!client) return
    const channel = client
      .channel(`animeverse-posts-${mode}-${targetId ?? 'all'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => void load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => void load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, () => void load())
      .subscribe()
    return () => { void client.removeChannel(channel) }
  }, [load, mode, targetId])

  const addPost = useCallback(async (input: NewPostInput): Promise<string | null> => {
    if (!supabase || !user) return 'Inicia sesión para publicar.'
    const text = input.text.trim()
    if (!text && !input.image) return 'Escribe algo o sube una imagen.'

    let imageUrl: string | null = null
    if (input.image) {
      const extension = input.image.name.split('.').pop() ?? 'jpg'
      const path = `${user.id}/${Date.now()}.${extension}`
      const { error: uploadError } = await supabase.storage.from('post-images').upload(path, input.image, {
        contentType: input.image.type,
        upsert: true,
      })
      if (uploadError) return `No se pudo subir la imagen: ${uploadError.message}`
      imageUrl = supabase.storage.from('post-images').getPublicUrl(path).data.publicUrl
    }

    const { error: insertError } = await supabase.from('posts').insert({
      user_id: user.id,
      text: text || null,
      image_url: imageUrl,
      anime_id: input.animeId ?? null,
    })
    if (insertError) return insertError.message
    await load()
    return null
  }, [supabase, user, load])

  const toggleLike = useCallback(async (postId: string) => {
    if (!supabase || !user) return 'Inicia sesión para dar me gusta.'
    const post = posts.find((item) => item.id === postId)
    if (!post) return null

    if (post.liked_by_me) {
      const { error } = await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', user.id)
      if (error) return error.message
      setPosts((current) => current.map((item) => item.id === postId
        ? { ...item, liked_by_me: false, like_count: Math.max(0, (item.like_count ?? 1) - 1) }
        : item))
    } else {
      const { error } = await supabase.from('likes').insert({ post_id: postId, user_id: user.id })
      if (error) return error.message
      setPosts((current) => current.map((item) => item.id === postId
        ? { ...item, liked_by_me: true, like_count: (item.like_count ?? 0) + 1 }
        : item))
    }
    return null
  }, [user, posts])

  const addComment = useCallback(async (postId: string, text: string): Promise<string | null> => {
    if (!supabase || !user) return 'Inicia sesión para comentar.'
    const clean = text.trim()
    if (!clean) return null
    const { error } = await supabase.from('comments').insert({ post_id: postId, user_id: user.id, text: clean })
    if (error) return error.message
    await load()
    return null
  }, [user, load])

  const deletePost = useCallback(async (postId: string): Promise<string | null> => {
    if (!supabase || !user) return 'Inicia sesión para borrar tus publicaciones.'
    const { error } = await supabase.from('posts').delete().eq('id', postId).eq('user_id', user.id)
    if (error) return error.message
    await load()
    return null
  }, [user, load])

  return { posts, loading, error, reload: load, addPost, toggleLike, addComment, deletePost, hashtags: parseHashtags(posts.map((post) => post.text).join(' ')) }
}
