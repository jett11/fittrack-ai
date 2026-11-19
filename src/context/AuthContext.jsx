import { createContext, useEffect, useState, useCallback } from 'react'
import { supabase, isDemoMode } from '../services/supabaseClient'

export const AuthContext = createContext(null)

const DEMO_USER_KEY = 'fittrack-demo-user'
const DEMO_PROFILE_KEY = 'fittrack-demo-profile'

function readDemoUser() {
  try {
    const raw = window.localStorage.getItem(DEMO_USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function readDemoProfile() {
  try {
    const raw = window.localStorage.getItem(DEMO_PROFILE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (userId) => {
    if (isDemoMode) {
      setProfile(readDemoProfile())
      return
    }
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data ?? null)
  }, [])

  useEffect(() => {
    if (isDemoMode) {
      const demoUser = readDemoUser()
      setUser(demoUser)
      if (demoUser) setProfile(readDemoProfile())
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
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

  const signUp = async (email, password) => {
    if (isDemoMode) {
      const demoUser = { id: crypto.randomUUID(), email, created_at: new Date().toISOString() }
      window.localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser))
      setUser(demoUser)
      setProfile(null)
      return { error: null }
    }
    const { data, error } = await supabase.auth.signUp({ email, password })
    return { data, error }
  }

  const signIn = async (email, password) => {
    if (isDemoMode) {
      const existing = readDemoUser()
      if (!existing || existing.email !== email) {
        return { error: { message: 'No demo account found with that email. Try signing up first.' } }
      }
      setUser(existing)
      setProfile(readDemoProfile())
      return { error: null }
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signInWithGoogle = async () => {
    if (isDemoMode) {
      return { error: { message: 'Google sign-in isn’t available in demo mode.' } }
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
    return { error }
  }

  const signOut = async () => {
    if (isDemoMode) {
      setUser(null)
      setProfile(null)
      return
    }
    await supabase.auth.signOut()
  }

  const resetPassword = async (email) => {
    if (isDemoMode) {
      return { error: { message: 'Password reset isn’t available in demo mode.' } }
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
  }

  const saveProfile = async (updates) => {
    if (!user) return { error: { message: 'Not signed in.' } }
    const nextProfile = { ...(profile ?? {}), ...updates, id: user.id }

    if (isDemoMode) {
      window.localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(nextProfile))
      setProfile(nextProfile)
      return { error: null }
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    if (!error) setProfile(data)
    return { error }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isDemoMode,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        saveProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
