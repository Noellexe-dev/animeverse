import { useCallback, useEffect, useState } from 'react'
import type { Comment, Post } from '../types'

const STORAGE_KEY = 'animeverse:social:v1'

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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
    } catch {
      // Almacenamiento no disponible; la comunidad sigue funcionando en sesión.
    }
  }, [posts])

  const addPost = useCallback((input: NewPostInput) => {
    const post: Post = {
      id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      animeId: input.animeId,
      author: input.author.trim() || 'Anónimo',
      text: input.text.trim(),
      rating: input.rating,
      likes: 0,
      likedByMe: false,
      createdAt: Date.now(),
      comments: [],
    }
    setPosts((current) => [post, ...current])
  }, [])

  const toggleLike = useCallback((postId: string) => {
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
  }, [])

  const addComment = useCallback((postId: string, author: string, text: string) => {
    const comment: Comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      author: author.trim() || 'Anónimo',
      text: text.trim(),
      createdAt: Date.now(),
    }
    setPosts((current) =>
      current.map((post) =>
        post.id === postId ? { ...post, comments: [...post.comments, comment] } : post,
      ),
    )
  }, [])

  const deletePost = useCallback((postId: string) => {
    setPosts((current) => current.filter((post) => post.id !== postId))
  }, [])

  return { posts, addPost, toggleLike, addComment, deletePost }
}
