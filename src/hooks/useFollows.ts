import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchProfiles } from '../lib/profiles'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

export function useFollows() {
  const { user } = useAuth()
  const [following, setFollowing] = useState<string[]>([])
  const [followers, setFollowers] = useState<string[]>([])
  const [people, setPeople] = useState<Profile[]>([])
  const [friendProfiles, setFriendProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!supabase) {
      setFollowing([])
      setFollowers([])
      setPeople([])
      setFriendProfiles([])
      setLoading(false)
      return
    }
    setLoading(true)

    const peopleQuery = user
      ? supabase.from('profiles').select('*').neq('id', user.id).limit(30)
      : supabase.from('profiles').select('*').limit(30)

    if (!user) {
      const { data } = await peopleQuery
      setFollowing([])
      setFollowers([])
      setPeople((data ?? []) as Profile[])
      setFriendProfiles([])
      setLoading(false)
      return
    }

    const [followingRes, followersRes, peopleRes] = await Promise.all([
      supabase.from('follows').select('following_id').eq('follower_id', user.id),
      supabase.from('follows').select('follower_id').eq('following_id', user.id),
      peopleQuery,
    ])
    const followingIds = (followingRes.data ?? []).map((row) => row.following_id as string)
    const followerIds = (followersRes.data ?? []).map((row) => row.follower_id as string)
    setFollowing(followingIds)
    setFollowers(followerIds)
    setPeople((peopleRes.data ?? []) as Profile[])
    const mutualIds = followingIds.filter((id) => followerIds.includes(id))
    if (mutualIds.length > 0) {
      setFriendProfiles(await fetchProfiles(mutualIds))
    } else {
      setFriendProfiles([])
    }
    setLoading(false)
  }, [user?.id])

  useEffect(() => {
    void load()
  }, [load])

  const toggleFollow = useCallback(async (targetId: string): Promise<string | null> => {
    if (!supabase || !user) return 'Inicia sesión para seguir a alguien.'
    if (following.includes(targetId)) {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetId)
      if (error) return error.message
    } else {
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: user.id, following_id: targetId })
      if (error) return error.message
    }
    await load()
    return null
  }, [user, following, load])

  const friends = friendProfiles
  const discover = people.filter((person) => !following.includes(person.id))

  return { following, followers, friends, discover, people, loading, toggleFollow, reload: load }
}

export function useProfile(username?: string) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase || !username) {
      setProfile(null)
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    supabase
      .from('profiles')
      .select('*')
      .eq('username', username.toLowerCase())
      .maybeSingle()
      .then(({ data }) => {
        if (active) {
          setProfile((data as Profile | null) ?? null)
          setLoading(false)
        }
      })
    return () => { active = false }
  }, [username])

  return { profile, loading }
}
