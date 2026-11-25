import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { AppState } from 'react-native'

// Same project, same URL, same anon key as the existing web app — this app
// reads and writes the identical Supabase backend, same users, same rows.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY — check .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Supabase's auto-refresh timer only ticks while something calls
// startAutoRefresh(); tying it to AppState means the token refreshes right
// away when the user reopens the app instead of silently expiring.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})
