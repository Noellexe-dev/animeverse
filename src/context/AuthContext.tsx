import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  isGuest: boolean
  enterAsGuest: () => void
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string, username: string) => Promise<string | null>
  signOut: () => Promise<void>
  deleteAccount: () => Promise<void>
  updateProfile: (patch: Partial<Pick<Profile, 'display_name' | 'bio' | 'is_public' | 'avatar_url'>>) => Promise<string | null>
  refreshProfile: () => Promise<void>
  claimAdmin: () => Promise<string>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const GUEST_KEY = 'animeverse:guest'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem(GUEST_KEY) === '1')

  const refreshProfile = useCallback(async () => {
    if (!supabase) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setProfile(null)
      return
    }
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
    setProfile((data as Profile | null) ?? null)
  }, [])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session?.user) {
      void refreshProfile()
    } else {
      setProfile(null)
    }
  }, [session, refreshProfile])

  const enterAsGuest = useCallback(() => {
    localStorage.setItem(GUEST_KEY, '1')
    setIsGuest(true)
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return 'La conexión con Supabase no está disponible.'
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return error.message
    localStorage.removeItem(GUEST_KEY)
    setIsGuest(false)
    return null
  }, [])

  const signUp = useCallback(async (email: string, password: string, username: string) => {
    if (!supabase) return 'La conexión con Supabase no está disponible.'
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
    if (cleanUsername.length < 3) return 'El usuario debe tener al menos 3 letras o números.'
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: cleanUsername, display_name: cleanUsername } },
    })
    if (error) return error.message
    localStorage.removeItem(GUEST_KEY)
    setIsGuest(false)
    return null
  }, [])

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
  }, [])

  const deleteAccount = useCallback(async () => {
    if (!supabase) return
    const { error } = await supabase.rpc('delete_my_account')
    if (error) throw new Error(error.message)
    setSession(null)
    setProfile(null)
    localStorage.removeItem(GUEST_KEY)
    setIsGuest(false)
  }, [])

  useEffect(() => {
    if (session?.user && supabase) {
      void supabase.rpc('touch_last_active')
    }
  }, [session?.user?.id])

  const claimAdmin = useCallback(async () => {
    if (!supabase) return 'La conexión con Supabase no está disponible.'
    const { data, error } = await supabase.rpc('claim_admin')
    if (error) return error.message
    await refreshProfile()
    return (data as string) ?? 'Listo.'
  }, [refreshProfile])

  const updateProfile = useCallback(async (patch: Partial<Pick<Profile, 'display_name' | 'bio' | 'is_public' | 'avatar_url'>>) => {
    if (!supabase || !session?.user) return 'Debes iniciar sesión.'
    const { error } = await supabase.from('profiles').update(patch).eq('id', session.user.id)
    if (error) return error.message
    await refreshProfile()
    return null
  }, [session, refreshProfile])

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        profile,
        session,
        loading,
        isGuest,
        enterAsGuest,
        signIn,
        signUp,
        signOut,
        deleteAccount,
        updateProfile,
        refreshProfile,
        claimAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}
