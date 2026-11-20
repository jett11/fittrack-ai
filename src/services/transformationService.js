import { supabase, isDemoMode } from './supabaseClient'

const DEMO_ERROR = { message: 'This isn’t available in demo mode — connect a real account.' }

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export async function logMeasurement(userId, { weight_kg, waist_cm, chest_cm, arm_cm, thigh_cm, notes }) {
  if (isDemoMode) return { error: DEMO_ERROR }
  const { data, error } = await supabase
    .from('body_measurements')
    .insert({
      user_id: userId,
      measured_at: todayStr(),
      weight_kg: weight_kg || null,
      waist_cm: waist_cm || null,
      chest_cm: chest_cm || null,
      arm_cm: arm_cm || null,
      thigh_cm: thigh_cm || null,
      notes: notes || null,
    })
    .select()
    .single()
  return { data, error }
}

export async function getMeasurementHistory(userId) {
  if (isDemoMode) return []
  const { data, error } = await supabase
    .from('body_measurements')
    .select('*')
    .eq('user_id', userId)
    .order('measured_at', { ascending: true })
  if (error) return []
  return data
}

export async function deleteMeasurement(id) {
  if (isDemoMode) return { error: DEMO_ERROR }
  const { error } = await supabase.from('body_measurements').delete().eq('id', id)
  return { error }
}

export async function uploadProgressPhoto(userId, file) {
  if (isDemoMode) return { error: DEMO_ERROR }
  const path = `${userId}/${Date.now()}-${file.name}`
  const { error: uploadError } = await supabase.storage.from('progress-photos').upload(path, file)
  if (uploadError) return { error: uploadError }

  const { data, error } = await supabase
    .from('progress_photos')
    .insert({ user_id: userId, storage_path: path, taken_at: todayStr() })
    .select()
    .single()
  return { data, error }
}

export async function getProgressPhotos(userId) {
  if (isDemoMode) return []
  const { data, error } = await supabase
    .from('progress_photos')
    .select('*')
    .eq('user_id', userId)
    .order('taken_at', { ascending: false })
  if (error) return []

  return Promise.all(
    data.map(async (p) => {
      const { data: signed } = await supabase.storage.from('progress-photos').createSignedUrl(p.storage_path, 3600)
      return { ...p, url: signed?.signedUrl }
    })
  )
}

export async function deleteProgressPhoto(id, storagePath) {
  if (isDemoMode) return { error: DEMO_ERROR }
  await supabase.storage.from('progress-photos').remove([storagePath])
  const { error } = await supabase.from('progress_photos').delete().eq('id', id)
  return { error }
}

/** Weight change over the trailing `days` window, from real logged entries only. */
export function periodSummary(history, days) {
  if (history.length === 0) return null
  const since = new Date()
  since.setDate(since.getDate() - days)
  const recent = history.filter((h) => new Date(h.measured_at) >= since && h.weight_kg != null)
  if (recent.length < 2) return null
  const change = recent.at(-1).weight_kg - recent[0].weight_kg
  return { change: Math.round(change * 10) / 10, entries: recent.length }
}

export function monthlySummary(history) {
  return periodSummary(history, 30)
}
