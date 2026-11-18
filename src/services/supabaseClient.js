import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isDemoMode = !url || !anonKey

if (isDemoMode && import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.warn(
    '[FitTrack AI] No Supabase credentials found — running in local demo mode. ' +
      'Data is saved to this browser only and will not sync. Add VITE_SUPABASE_URL and ' +
      'VITE_SUPABASE_ANON_KEY to .env.local to connect a real database.'
  )
}

export const supabase = isDemoMode
  ? null
  : createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
