// Same table/column as the web app's preferencesService.js (user_preferences
// .notifications_enabled) — a user's notification preference is shared
// between both apps, not a separate mobile-only setting.
import { supabase } from './supabaseClient'

export async function getNotificationPreference(userId) {
  const { data, error } = await supabase.from('user_preferences').select('notifications_enabled').eq('user_id', userId).maybeSingle()
  if (error || !data) return true
  return data.notifications_enabled
}

export async function setNotificationPreference(userId, enabled) {
  const { error } = await supabase.from('user_preferences').upsert({ user_id: userId, notifications_enabled: enabled }, { onConflict: 'user_id' })
  return { error }
}
