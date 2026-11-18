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

export async function createRoutine(userId, { name, goal, level, location, exerciseIds }) {
  if (isDemoMode) return { error: DEMO_ERROR }
  const { data: workout, error } = await supabase
    .from('workouts')
    .insert({ user_id: userId, name, goal, level, location, is_template: false })
    .select()
    .single()
  if (error) return { error }

  const rows = exerciseIds.map((exerciseId, i) => ({
    workout_id: workout.id,
    exercise_id: exerciseId,
    position: i,
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
