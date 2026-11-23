import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Comment, Post } from '../types'

const STORAGE_KEY = 'animeverse:social:v1'

interface PostRow {
  id: string
  created_at: string
  anime_id: string
  author: string
  text: string
  rating: number
  likes: number
}

interface CommentRow {
  id: string
  created_at: string
  post_id: string
  author: string
  text: string
}

function mapComment(row: CommentRow): Comment {
  return {
    id: row.id,
    author: row.author,
    text: row.text,
    createdAt: new Date(row.created_at).getTime(),
  }
}

function mapPost(row: PostRow, comments: CommentRow[]): Post {
  return {
    id: row.id,
    animeId: row.anime_id,
    author: row.author,
    text: row.text,
    rating: row.rating,
    likes: row.likes,
    likedByMe: false,
    createdAt: new Date(row.created_at).getTime(),
    comments: comments
      .filter((comment) => comment.post_id === row.id)
      .map(mapComment)
      .sort((a, b) => a.createdAt - b.createdAt),
  }
}

const now = Date.now()

const seedPosts: Post[] = [
  {
    id: 'seed-1',
    animeId: 'fullmetal-alchemist-brotherhood',
    author: 'Maru',
    text: 'El equilibrio perfecto entre acción, drama y una historia que no pierde el ritmo. Lo recomiendo siempre.',
    rating: 10,
    likes: 12,
    likedByMe: false,
    createdAt: now - 1000 * 60 * 60 * 26,
    comments: [
      {
        id: 'seed-c1',
        author: 'Kuro',
        text: 'Totalmente. El final es de los mejores que he visto.',
        createdAt: now - 1000 * 60 * 60 * 20,
      },
    ],
  },
  {
    id: 'seed-2',
    animeId: 'spirited-away',
    author: 'Saku',
    text: 'Para una tarde lluviosa no hay nada mejor. La animación es pura magia.',
    rating: 9,
    likes: 8,
    likedByMe: false,
    createdAt: now - 1000 * 60 * 60 * 8,
    comments: [],
  },
  {
    id: 'seed-3',
    animeId: 'cyberpunk-edgerunners',
    author: 'Kuro',
    text: 'Solo 10 episodios y te deja pensando durante días. La banda sonora increíble.',
    rating: 9,
    likes: 6,
    likedByMe: false,
    createdAt: now - 1000 * 60 * 60 * 3,
    comments: [],
  },
]

function readPosts(): Post[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return seedPosts
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return seedPosts
    return parsed.filter((post): post is Post => {
      if (typeof post !== 'object' || post === null) return false
      const candidate = post as Partial<Post>
      return (
        typeof candidate.id === 'string' &&
        typeof candidate.animeId === 'string' &&
        typeof candidate.author === 'string' &&
        typeof candidate.text === 'string' &&
        typeof candidate.rating === 'number' &&
        typeof candidate.likes === 'number' &&
        Array.isArray(candidate.comments)
      )
    })
  } catch {
    return seedPosts
  }
}

export interface NewPostInput {
  animeId: string
  author: string
  text: string
  rating: number
}

export function useSocialState() {
  const [posts, setPosts] = useState<Post[]>(readPosts)
  const remote = supabase

  const loadRemote = useCallback(async () => {
    if (!remote) return
    const { data: postRows, error } = await remote
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    if (error || !postRows) return

    const { data: commentRows } = await remote.from('comments').select('*')
    setPosts(
      (postRows as PostRow[]).map((row) =>
        mapPost(row, (commentRows as CommentRow[]) ?? []),
      ),
    )
  }, [remote])

  useEffect(() => {
    if (!remote) return
    void loadRemote()

    const channel = remote
      .channel('animeverse-social')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        () => void loadRemote(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments' },
        () => void loadRemote(),
      )
      .subscribe()

    return () => {
      void remote.removeChannel(channel)
    }
  }, [remote, loadRemote])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
    } catch {
      // Almacenamiento no disponible; la comunidad sigue funcionando en sesión.
    }
  }, [posts])

  const addPost = useCallback(
    (input: NewPostInput) => {
      const author = input.author.trim() || 'Anónimo'
      const text = input.text.trim()

      if (remote) {
        void (async () => {
          const { data, error } = await remote
            .from('posts')
            .insert({ anime_id: input.animeId, author, text, rating: input.rating })
            .select()
            .single()
          if (!error && data) {
            setPosts((current) => [mapPost(data as PostRow, []), ...current])
          } else {
            void loadRemote()
          }
        })()
        return
      }

      const post: Post = {
        id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        animeId: input.animeId,
        author,
        text,
        rating: input.rating,
        likes: 0,
        likedByMe: false,
        createdAt: Date.now(),
        comments: [],
      }
      setPosts((current) => [post, ...current])
    },
    [remote, loadRemote],
  )

  const toggleLike = useCallback(
    (postId: string) => {
      if (remote) {
        const target = posts.find((post) => post.id === postId)
        void (async () => {
          await remote
            .from('posts')
            .update({ likes: target ? target.likes + (target.likedByMe ? -1 : 1) : 0 })
            .eq('id', postId)
          await loadRemote()
        })()
      }

      setPosts((current) =>
        current.map((post) =>
          post.id === postId
            ? {
                ...post,
                likedByMe: !post.likedByMe,
                likes: post.likes + (post.likedByMe ? -1 : 1),
              }
            : post,
        ),
      )
    },
    [remote, posts, loadRemote],
  )

  const addComment = useCallback(
    (postId: string, author: string, text: string) => {
      const commentAuthor = author.trim() || 'Anónimo'
      const commentText = text.trim()

      if (remote) {
        void (async () => {
          const { error } = await remote.from('comments').insert({
            post_id: postId,
            author: commentAuthor,
            text: commentText,
          })
          if (error) {
            void loadRemote()
          } else {
            await loadRemote()
          }
        })()
      }

      const comment: Comment = {
        id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        author: commentAuthor,
        text: commentText,
        createdAt: Date.now(),
      }
      setPosts((current) =>
        current.map((post) =>
          post.id === postId ? { ...post, comments: [...post.comments, comment] } : post,
        ),
      )
    },
    [remote, loadRemote],
  )

  const deletePost = useCallback(
    (postId: string) => {
      if (remote) {
        void (async () => {
          await remote.from('posts').delete().eq('id', postId)
          await loadRemote()
        })()
      }
      setPosts((current) => current.filter((post) => post.id !== postId))
    },
    [remote, loadRemote],
  )

  return { posts, addPost, toggleLike, addComment, deletePost }
}
