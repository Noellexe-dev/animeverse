import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { fetchProfiles } from '../lib/profiles'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

export interface AppNotification {
  id: string
  kind: 'follow' | 'comment' | 'like' | 'message' | 'reply'
  text: string
  href: string
  created_at: string
  read: boolean
}

interface NotificationsContextValue {
  notifications: AppNotification[]
  hasUnread: boolean
  hasChatUnread: boolean
  markAllRead: () => void
  markChatsRead: () => void
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

function storageKey(userId: string) {
  return `animeverse:notifications:${userId}`
}
function checkKey(userId: string) {
  return `animeverse:notifications:check:${userId}`
}

function readStored(userId: string): AppNotification[] {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as AppNotification[]) : []
  } catch {
    return []
  }
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<AppNotification[]>([])

  const update = useCallback((change: (current: AppNotification[]) => AppNotification[]) => {
    setNotifications((current) => {
      const next = change(current)
      if (user) {
        try {
          localStorage.setItem(storageKey(user.id), JSON.stringify(next))
        } catch {
          // almacenamiento no disponible
        }
      }
      return next
    })
  }, [user?.id])

  useEffect(() => {
    if (!user) {
      setNotifications([])
      return
    }
    setNotifications(readStored(user.id))
  }, [user?.id])

  const check = useCallback(async () => {
    if (!supabase || !user) return
    const last = localStorage.getItem(checkKey(user.id))
    const fallback = new Date(Date.now() - 15 * 60 * 1000).toISOString()
    const since = new Date(Math.max(0, new Date(last ?? fallback).getTime() - 5000)).toISOString()

    const [followsRes, commentsRes, likesRes, messagesRes] = await Promise.all([
      supabase.from('follows').select('follower_id,created_at').eq('following_id', user.id).gte('created_at', since),
      supabase.from('comments').select('id,post_id,user_id,created_at').gte('created_at', since),
      supabase.from('likes').select('post_id,user_id,created_at').gte('created_at', since),
      supabase.from('messages').select('sender_id,created_at').eq('recipient_id', user.id).gte('created_at', since),
    ])

    const follows = followsRes.data ?? []
    const comments = (commentsRes.data ?? []).filter((row) => row.user_id !== user.id)
    const likes = (likesRes.data ?? []).filter((row) => row.user_id !== user.id)
    const messages = (messagesRes.data ?? []).filter((row) => row.sender_id !== user.id)

    const postIds = Array.from(new Set([
      ...comments.map((row) => row.post_id),
      ...likes.map((row) => row.post_id),
    ]))

    let posts: { id: string; user_id: string }[] = []
    if (postIds.length > 0) {
      const { data } = await supabase.from('posts').select('id,user_id').in('id', postIds)
      posts = (data ?? []) as { id: string; user_id: string }[]
    }
    const postMap = new Map(posts.map((post) => [post.id, post]))

    let myCommentedPosts = new Set<string>()
    if (postIds.length > 0) {
      const { data } = await supabase.from('comments').select('post_id').eq('user_id', user.id).in('post_id', postIds)
      myCommentedPosts = new Set((data ?? []).map((row) => row.post_id as string))
    }

    const actorIds = Array.from(new Set([
      ...follows.map((row) => row.follower_id),
      ...comments.map((row) => row.user_id),
      ...likes.map((row) => row.user_id),
      ...messages.map((row) => row.sender_id),
    ]))
    const profiles = await fetchProfiles(actorIds)
    const profileMap = new Map(profiles.map((profile) => [profile.id, profile]))
    const nameOf = (id: string) => {
      const profile = profileMap.get(id) as Profile | undefined
      return profile?.display_name ?? profile?.username ?? 'Alguien'
    }
    const profileHref = (id: string) => {
      const profile = profileMap.get(id) as Profile | undefined
      return profile ? `/perfil/${profile.username}` : '/comunidad'
    }

    const found: AppNotification[] = []

    for (const row of follows) {
      if (row.follower_id === user.id) continue
      found.push({
        id: `follow:${row.follower_id}:${row.created_at}`,
        kind: 'follow',
        text: `${nameOf(row.follower_id)} te empezó a seguir`,
        href: profileHref(row.follower_id),
        created_at: row.created_at,
        read: false,
      })
    }

    for (const row of comments) {
      const post = postMap.get(row.post_id)
      const isMyPost = post?.user_id === user.id
      const isReplyToMe = myCommentedPosts.has(row.post_id)
      if (!isMyPost && !isReplyToMe) continue
      found.push({
        id: `comment:${row.id}`,
        kind: isReplyToMe && !isMyPost ? 'reply' : 'comment',
        text: `${nameOf(row.user_id)} ${isMyPost ? 'comentó tu publicación' : 'respondió en una conversación'}`,
        href: `/comunidad?post=${row.post_id}`,
        created_at: row.created_at,
        read: false,
      })
    }

    for (const row of likes) {
      const post = postMap.get(row.post_id)
      if (post?.user_id !== user.id) continue
      found.push({
        id: `like:${row.post_id}:${row.user_id}:${row.created_at}`,
        kind: 'like',
        text: `A ${nameOf(row.user_id)} le gustó tu publicación`,
        href: `/comunidad?post=${row.post_id}`,
        created_at: row.created_at,
        read: false,
      })
    }

    for (const row of messages) {
      found.push({
        id: `message:${row.sender_id}:${row.created_at}`,
        kind: 'message',
        text: `Mensaje nuevo de ${nameOf(row.sender_id)}`,
        href: `/chats?con=${row.sender_id}`,
        created_at: row.created_at,
        read: false,
      })
    }

    if (found.length > 0) {
      update((current) => {
        const byId = new Map(current.map((item) => [item.id, item]))
        for (const item of found) if (!byId.has(item.id)) byId.set(item.id, item)
        return Array.from(byId.values())
          .sort((a, b) => b.created_at.localeCompare(a.created_at))
          .slice(0, 40)
      })
    }
    localStorage.setItem(checkKey(user.id), new Date().toISOString())
  }, [user?.id, update])

  useEffect(() => {
    if (!user || !supabase) return
    const client = supabase
    void check()
    const timer = window.setInterval(() => void check(), 20000)
    const channel = client
      .channel(`animeverse-notify-${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'follows' }, () => void check())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, () => void check())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'likes' }, () => void check())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => void check())
      .subscribe()
    return () => {
      window.clearInterval(timer)
      void client.removeChannel(channel)
    }
  }, [user?.id, check])

  const markAllRead = useCallback(() => {
    update((current) => current.map((item) => ({ ...item, read: true })))
  }, [update])

  const markChatsRead = useCallback(() => {
    update((current) => current.map((item) => (item.kind === 'message' ? { ...item, read: true } : item)))
  }, [update])

  return (
    <NotificationsContext.Provider value={{
      notifications,
      hasUnread: notifications.some((item) => !item.read),
      hasChatUnread: notifications.some((item) => item.kind === 'message' && !item.read),
      markAllRead,
      markChatsRead,
    }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications(): NotificationsContextValue {
  const context = useContext(NotificationsContext)
  if (!context) throw new Error('useNotifications debe usarse dentro de NotificationsProvider')
  return context
}
