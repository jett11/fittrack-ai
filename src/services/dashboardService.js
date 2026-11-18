import { supabase } from './supabaseClient'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

/** A 7-day (oldest-to-newest) skeleton with everything marked incomplete. */
export function buildEmptyWeek() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    days.push({ date: key, label: d.toLocaleDateString('en-IN', { weekday: 'short' }), completed: false })
  }
  return days
}

export async function getTodayWater(userId) {
  try {
    const { data, error } = await supabase
      .from('daily_metrics')
      .select('water_glasses')
      .eq('user_id', userId)
      .eq('metric_date', todayStr())
      .maybeSingle()
    if (error) throw error
    return data?.water_glasses ?? 0
  } catch {
    // Table may not exist yet if migration 0004 hasn't been run — degrade gracefully.
    return 0
  }
}

export async function setTodayWater(userId, glasses) {
  try {
    const { error } = await supabase
      .from('daily_metrics')
      .upsert({ user_id: userId, metric_date: todayStr(), water_glasses: glasses }, { onConflict: 'user_id,metric_date' })
    if (error) throw error
    return true
  } catch {
    return false
  }
}

export async function getTodayMealTotals(userId) {
  const { data, error } = await supabase
    .from('meal_logs')
    .select('calories, protein_g, carbs_g, fat_g')
    .eq('user_id', userId)
    .eq('logged_date', todayStr())
  if (error || !data) return { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, count: 0 }
  return data.reduce(
    (acc, row) => ({
      calories: acc.calories + Number(row.calories || 0),
      protein_g: acc.protein_g + Number(row.protein_g || 0),
      carbs_g: acc.carbs_g + Number(row.carbs_g || 0),
      fat_g: acc.fat_g + Number(row.fat_g || 0),
      count: acc.count + 1,
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, count: 0 }
  )
}

export async function getTodayWorkoutSession(userId) {
  const { data } = await supabase
    .from('workout_sessions')
    .select('id, status, started_at, completed_at, workouts(name)')
    .eq('user_id', userId)
    .gte('started_at', `${todayStr()}T00:00:00`)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data ?? null
}

/** Returns an array of 7 entries (oldest to newest) with a 0-100 "did something" score. */
export async function getWeeklyConsistency(userId) {
  const since = new Date()
  since.setDate(since.getDate() - 6)
  const sinceStr = since.toISOString().slice(0, 10)

  const { data } = await supabase
    .from('workout_sessions')
    .select('started_at, status')
    .eq('user_id', userId)
    .gte('started_at', `${sinceStr}T00:00:00`)

  const byDate = {}
  ;(data ?? []).forEach((s) => {
    const d = s.started_at.slice(0, 10)
    if (s.status === 'completed') byDate[d] = true
  })

  return buildEmptyWeek().map((d) => ({ ...d, completed: !!byDate[d.date] }))
}

export async function getWeightHistory(userId, limitCount = 8) {
  const { data } = await supabase
    .from('body_measurements')
    .select('measured_at, weight_kg')
    .eq('user_id', userId)
    .not('weight_kg', 'is', null)
    .order('measured_at', { ascending: true })
    .limit(limitCount)
  return data ?? []
}
