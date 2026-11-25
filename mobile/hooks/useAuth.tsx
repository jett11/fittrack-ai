import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../services/supabaseClient'
import type { Session, User } from '@supabase/supabase-js'

type Profile = Record<string, any> | null

type AuthContextValue = {
  user: User | null
  profile: Profile
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  saveProfile: (updates: Record<string, any>) => Promise<{ error: any }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data ?? null)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      setUser(data.session?.user ?? null)
      if (data.session?.user) loadProfile(data.session.user.id)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [loadProfile])

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const saveProfile = async (updates: Record<string, any>) => {
    if (!user) return { error: { message: 'Not signed in.' } }
    const { data, error } = await supabase.from('profiles').update(updates).eq('id', user.id).select().single()
    if (!error) setProfile(data)
    return { error }
  }

  const refreshProfile = async () => {
    if (user) await loadProfile(user.id)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, saveProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
