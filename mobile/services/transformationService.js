// Same queries/table/storage shapes as the web app's transformationService.js,
// ported without the web-only demo-mode branches. uploadProgressPhoto differs
// because React Native has no browser File object — it reads the local file
// URI (from expo-image-picker) into bytes before uploading.
import { supabase } from './supabaseClient'
import { File } from 'expo-file-system'
import { decode } from 'base64-arraybuffer'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * @param {string} userId
 * @param {{ weight_kg?: number, waist_cm?: number, chest_cm?: number, arm_cm?: number, thigh_cm?: number, notes?: string }} entry
 */
export async function logMeasurement(userId, { weight_kg, waist_cm, chest_cm, arm_cm, thigh_cm, notes }) {
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
  const { data, error } = await supabase
    .from('body_measurements')
    .select('*')
    .eq('user_id', userId)
    .order('measured_at', { ascending: true })
  if (error) return []
  return data
}

export async function deleteMeasurement(id) {
  const { error } = await supabase.from('body_measurements').delete().eq('id', id)
  return { error }
}

export async function uploadProgressPhoto(userId, localUri) {
  const ext = localUri.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${userId}/${Date.now()}.${ext}`
  const base64 = await new File(localUri).base64()

  const { error: uploadError } = await supabase.storage
    .from('progress-photos')
    .upload(path, decode(base64), { contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}` })
  if (uploadError) return { error: uploadError }

  const { data, error } = await supabase
    .from('progress_photos')
    .insert({ user_id: userId, storage_path: path, taken_at: todayStr() })
    .select()
    .single()
  return { data, error }
}

export async function getProgressPhotos(userId) {
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
