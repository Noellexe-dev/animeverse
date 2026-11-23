import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import type { Message, Profile } from '../types'

export function useChats() {
  const { user } = useAuth()
  const [contacts, setContacts] = useState<Profile[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)

  const loadContacts = useCallback(async () => {
    if (!supabase || !user) {
      setContacts([])
      return
    }
    const [followingRes, followersRes] = await Promise.all([
      supabase.from('follows').select('following_id').eq('follower_id', user.id),
      supabase.from('follows').select('follower_id').eq('following_id', user.id),
    ])
    const mutual = (followingRes.data ?? []).map((row) => row.following_id as string)
      .filter((id) => (followersRes.data ?? []).some((row) => row.follower_id === id))
    if (mutual.length === 0) {
      setContacts([])
      return
    }
    const { data } = await supabase
      .from('profiles')
      .select('id,username,display_name,avatar_url,is_public')
      .in('id', mutual)
    setContacts((data ?? []) as Profile[])
  }, [user?.id])

  useEffect(() => {
    void (async () => {
      if (supabase) await supabase.rpc('cleanup_old_messages')
      await loadContacts()
      setLoading(false)
    })()
  }, [loadContacts])

  const loadMessages = useCallback(async (otherId: string) => {
    if (!supabase || !user) return
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${user.id})`)
      .order('created_at', { ascending: true })
    setMessages((data ?? []) as Message[])
  }, [user?.id])

  useEffect(() => {
    if (activeId) void loadMessages(activeId)
    else setMessages([])
  }, [activeId, loadMessages])

  useEffect(() => {
    const client = supabase
    if (!client || !activeId) return
    const channel = client
      .channel(`animeverse-chat-${activeId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => void loadMessages(activeId))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, () => void loadMessages(activeId))
      .subscribe()
    return () => { void client.removeChannel(channel) }
  }, [activeId, loadMessages])

  const sendMessage = useCallback(async (recipientId: string, text: string): Promise<string | null> => {
    if (!supabase || !user) return 'Inicia sesión para chatear.'
    const clean = text.trim()
    if (!clean) return null
    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      recipient_id: recipientId,
      text: clean,
    })
    if (error) return error.message
    await loadMessages(recipientId)
    return null
  }, [user, loadMessages])

  return { contacts, messages, loading, activeId, setActiveId, sendMessage, reload: loadContacts }
}
