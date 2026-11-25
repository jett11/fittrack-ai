// Same queries/table shapes as the web app's workoutService.js — ported
// without the web-only demo-mode branches, since the mobile app only ever
// talks to a real signed-in account.
import { supabase } from './supabaseClient'

export async function getTemplates() {
  const { data, error } = await supabase.from('workouts').select('*').eq('is_template', true).order('name')
  if (error) return []
  return data
}

export async function getMyRoutines(userId) {
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
  const { data, error } = await supabase
    .from('workouts')
    .select('*, workout_exercises(*, exercises(*))')
    .eq('id', workoutId)
    .single()
  if (error) return null
  data.workout_exercises.sort((a, b) => a.position - b.position)
  return data
}

export async function startSession(userId, workoutId) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({ user_id: userId, workout_id: workoutId, status: 'in_progress' })
    .select()
    .single()
  return { data, error }
}

export async function getActiveSession(userId) {
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
  const { data, error } = await supabase.from('workout_logs').select('*').eq('session_id', sessionId)
  if (error) return []
  return data
}

export async function logSet(sessionId, exerciseId, setNumber, { repsCompleted, weightKg, completed = true }) {
  const { data, error } = await supabase
    .from('workout_logs')
    .upsert(
      { session_id: sessionId, exercise_id: exerciseId, set_number: setNumber, reps_completed: repsCompleted, weight_kg: weightKg, completed },
      { onConflict: 'session_id,exercise_id,set_number' }
    )
    .select()
    .single()
  return { data, error }
}

export async function completeSession(sessionId) {
  const { error } = await supabase
    .from('workout_sessions')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', sessionId)
  return { error }
}

export async function abandonSession(sessionId) {
  const { error } = await supabase.from('workout_sessions').update({ status: 'abandoned' }).eq('id', sessionId)
  return { error }
}

export async function getWorkoutHistory(userId, limitCount = 20) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*, workouts(name)')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limitCount)
  if (error) return []
  return data
}

export async function getLastSetsForExercises(exerciseIds, excludeSessionId) {
  if (!exerciseIds?.length) return {}
  const { data, error } = await supabase
    .from('workout_logs')
    .select('session_id, exercise_id, weight_kg, reps_completed, created_at')
    .in('exercise_id', exerciseIds)
    .eq('completed', true)
    .neq('session_id', excludeSessionId)
    .order('created_at', { ascending: false })
  if (error) return {}
  const byExercise = {}
  data.forEach((log) => {
    if (!byExercise[log.exercise_id]) byExercise[log.exercise_id] = log
  })
  return byExercise
}
