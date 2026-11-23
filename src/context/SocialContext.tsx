import { createContext, useContext, type ReactNode } from 'react'
import { useSocialState, type NewPostInput } from '../hooks/useSocialState'
import type { Post } from '../types'

interface SocialContextValue {
  posts: Post[]
  addPost: (input: NewPostInput) => void
  toggleLike: (postId: string) => void
  addComment: (postId: string, author: string, text: string) => void
  deletePost: (postId: string) => void
}

const SocialContext = createContext<SocialContextValue | null>(null)

export function SocialProvider({ children }: { children: ReactNode }) {
  const value = useSocialState()
  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>
}

export function useSocial(): SocialContextValue {
  const context = useContext(SocialContext)
  if (!context) {
    throw new Error('useSocial debe usarse dentro de SocialProvider')
  }
  return context
}
