import { supabase, isDemoMode } from './supabaseClient'

export async function requestUpgrade(userId) {
  if (isDemoMode) return { error: { message: 'Not available in demo mode.' } }
  const { data, error } = await supabase
    .from('upgrade_requests')
    .insert({ user_id: userId })
    .select()
    .single()
  return { data, error }
}

export async function getLatestUpgradeRequest(userId) {
  if (isDemoMode) return null
  const { data } = await supabase
    .from('upgrade_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data
}
