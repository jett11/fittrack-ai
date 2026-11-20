import { supabase, isDemoMode } from './supabaseClient'

export async function getNotificationPreference(userId) {
  if (isDemoMode) return true
  const { data, error } = await supabase
    .from('user_preferences')
    .select('notifications_enabled')
    .eq('user_id', userId)
    .maybeSingle()
  if (error || !data) return true
  return data.notifications_enabled
}

export async function setNotificationPreference(userId, enabled) {
  if (isDemoMode) return { error: null }
  const { error } = await supabase
    .from('user_preferences')
    .upsert({ user_id: userId, notifications_enabled: enabled }, { onConflict: 'user_id' })
  return { error }
}
