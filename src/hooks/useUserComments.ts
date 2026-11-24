import { useEffect, useState } from 'react'
import { fetchProfiles } from '../lib/profiles'
import { supabase } from '../lib/supabase'
import type { Post, PostComment } from '../types'

export interface UserCommentActivity {
  id: string
  text: string
  created_at: string
  post: Post | null
}

/** Respuestas que una persona dejó en publicaciones de la comunidad. */
export function useUserComments(userId?: string) {
  const [comments, setComments] = useState<UserCommentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    if (!supabase || !userId) {
      setComments([])
      setLoading(false)
      return
    }
    setLoading(true)

    void (async () => {
      const { data } = await supabase
        .from('comments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      const rows = (data ?? []) as PostComment[]
      if (rows.length === 0) {
        if (active) { setComments([]); setLoading(false) }
        return
      }

      const postIds = Array.from(new Set(rows.map((row) => row.post_id)))
      const [{ data: postsData }, profiles] = await Promise.all([
        supabase.from('posts').select('*').in('id', postIds),
        fetchProfiles(rows.map((row) => row.user_id)),
      ])
      const postAuthors = await fetchProfiles(((postsData ?? []) as { user_id: string }[]).map((post) => post.user_id))
      const allAuthors = [...postAuthors, ...profiles]
      const authorMap = new Map(allAuthors.map((profile) => [profile.id, profile]))
      const postMap = new Map(
        ((postsData ?? []) as { id: string; user_id: string }[]).map((post) => [post.id, post]),
      )

      const result: UserCommentActivity[] = rows.map((row) => {
        const raw = postMap.get(row.post_id) as Record<string, unknown> | undefined
        const post = raw ? ({
          ...raw,
          author: authorMap.get(raw.user_id as string) ?? null,
          comments: [],
          like_count: 0,
          liked_by_me: false,
        }) as unknown as Post : null
        return { id: row.id, text: row.text, created_at: row.created_at, post }
      })

      if (active) {
        setComments(result)
        setLoading(false)
      }
    })()

    return () => { active = false }
  }, [userId])

  return { comments, loading }
}
