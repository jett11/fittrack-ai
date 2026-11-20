import { supabase, isDemoMode } from './supabaseClient'

const DEMO_ERROR = { message: 'This isn’t available in demo mode — connect a real account.' }

export async function getTemplates() {
  if (isDemoMode) return []
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('is_template', true)
    .order('name')
  if (error) return []
  return data
}

export async function getMyRoutines(userId) {
  if (isDemoMode) return []
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .eq('is_template', false)
    .order('created_at', { ascending: false })
  if (error) return []
  return data
}

export async function getWorkoutWithExercises(workoutId) {
  if (isDemoMode) return null
  const { data, error } = await supabase
    .from('workouts')
    .select('*, workout_exercises(*, exercises(*))')
    .eq('id', workoutId)
    .single()
  if (error) return null
  data.workout_exercises.sort((a, b) => a.position - b.position)
  return data
}

export async function createRoutine(userId, { name, goal, level, location, exerciseIds, items }) {
  if (isDemoMode) return { error: DEMO_ERROR }
  const { data: workout, error } = await supabase
    .from('workouts')
    .insert({ user_id: userId, name, goal, level, location, is_template: false })
    .select()
    .single()
  if (error) return { error }

  const list = items ?? exerciseIds.map((id) => ({ id }))
  const rows = list.map((item, i) => ({
    workout_id: workout.id,
    exercise_id: item.id,
    position: i,
    target_sets: item.sets ?? null,
    target_reps: item.reps ?? null,
    rest_seconds: item.rest_seconds ?? null,
  }))
  if (rows.length) {
    const { error: linkError } = await supabase.from('workout_exercises').insert(rows)
    if (linkError) return { error: linkError }
  }
  return { data: workout }
}

export async function deleteRoutine(workoutId) {
  if (isDemoMode) return { error: DEMO_ERROR }
  const { error } = await supabase.from('workouts').delete().eq('id', workoutId)
  return { error }
}

export async function searchExercises({ query = '', muscleGroup = '', location = '' } = {}) {
  if (isDemoMode) return []
  let q = supabase.from('exercises').select('*').order('name')
  if (query) q = q.ilike('name', `%${query}%`)
  if (muscleGroup) q = q.eq('muscle_group', muscleGroup)
  if (location) q = q.in('location', [location, 'both'])
  const { data, error } = await q
  if (error) return []
  return data
}

export async function getMuscleGroups() {
  if (isDemoMode) return []
  const { data, error } = await supabase.from('exercises').select('muscle_group')
  if (error) return []
  return [...new Set(data.map((d) => d.muscle_group))].sort()
}

export async function startSession(userId, workoutId) {
  if (isDemoMode) return { error: DEMO_ERROR }
  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({ user_id: userId, workout_id: workoutId, status: 'in_progress' })
    .select()
    .single()
  return { data, error }
}

export async function getActiveSession(userId) {
  if (isDemoMode) return null
  const { data } = await supabase
    .from('workout_sessions')
    .select('*, workouts(name, workout_exercises(*, exercises(*)))')
    .eq('user_id', userId)
    .eq('status', 'in_progress')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (data?.workouts?.workout_exercises) {
    data.workouts.workout_exercises.sort((a, b) => a.position - b.position)
  }
  return data
}

export async function getSessionLogs(sessionId) {
  if (isDemoMode) return []
  const { data, error } = await supabase.from('workout_logs').select('*').eq('session_id', sessionId)
  if (error) return []
  return data
}

export async function logSet(sessionId, exerciseId, setNumber, { repsCompleted, weightKg, completed = true }) {
  if (isDemoMode) return { error: DEMO_ERROR }
  const { data, error } = await supabase
    .from('workout_logs')
    .upsert(
      {
        session_id: sessionId,
        exercise_id: exerciseId,
        set_number: setNumber,
        reps_completed: repsCompleted,
        weight_kg: weightKg,
        completed,
      },
      { onConflict: 'session_id,exercise_id,set_number' }
    )
    .select()
    .single()
  return { data, error }
}

export async function completeSession(sessionId) {
  if (isDemoMode) return { error: DEMO_ERROR }
  const { error } = await supabase
    .from('workout_sessions')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', sessionId)
  return { error }
}

export async function abandonSession(sessionId) {
  if (isDemoMode) return { error: DEMO_ERROR }
  const { error } = await supabase.from('workout_sessions').update({ status: 'abandoned' }).eq('id', sessionId)
  return { error }
}

export async function getWorkoutHistory(userId, limitCount = 20) {
  if (isDemoMode) return []
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*, workouts(name)')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limitCount)
  if (error) return []
  return data
}

const EMPTY_ANALYTICS = {
  totalWorkouts: 0,
  weeklyFrequency: 0,
  totalMinutes: 0,
  muscleGroupDistribution: [],
  personalRecords: [],
}

/**
 * Aggregates real session/log data into analytics. All figures are derived
 * from actual logged sessions — nothing here is estimated or invented.
 */
export async function getWorkoutAnalytics(userId) {
  if (isDemoMode) return EMPTY_ANALYTICS

  const since = new Date()
  since.setDate(since.getDate() - 6)

  const [{ data: sessions }, { data: logs }] = await Promise.all([
    supabase
      .from('workout_sessions')
      .select('id, status, started_at, completed_at')
      .eq('user_id', userId)
      .eq('status', 'completed'),
    // workout_logs has no user_id column, but its RLS policy already scopes
    // rows to sessions owned by the requesting user — no manual filter needed.
    supabase
      .from('workout_logs')
      .select('exercise_id, weight_kg, reps_completed, completed, exercises(name, muscle_group)')
      .eq('completed', true),
  ])

  const completed = sessions ?? []
  const totalWorkouts = completed.length
  const weeklyFrequency = completed.filter((s) => new Date(s.started_at) >= since).length

  const totalMinutes = completed.reduce((sum, s) => {
    if (!s.completed_at) return sum
    const mins = (new Date(s.completed_at) - new Date(s.started_at)) / 60000
    return sum + (mins > 0 && mins < 6 * 60 ? mins : 0) // guard against bad/missing timestamps
  }, 0)

  const byMuscle = {}
  const bestByExercise = {}
  ;(logs ?? []).forEach((log) => {
    const group = log.exercises?.muscle_group ?? 'Other'
    byMuscle[group] = (byMuscle[group] || 0) + 1

    const weight = Number(log.weight_kg)
    if (weight > 0) {
      const name = log.exercises?.name ?? 'Exercise'
      if (!bestByExercise[name] || weight > bestByExercise[name].weight) {
        bestByExercise[name] = { name, weight, reps: log.reps_completed }
      }
    }
  })

  const muscleGroupDistribution = Object.entries(byMuscle)
    .map(([group, sets]) => ({ group, sets }))
    .sort((a, b) => b.sets - a.sets)

  const personalRecords = Object.values(bestByExercise)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5)

  return { totalWorkouts, weeklyFrequency, totalMinutes: Math.round(totalMinutes), muscleGroupDistribution, personalRecords }
}
