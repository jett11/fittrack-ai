// Ported from the web app's challengeService.js (same table shapes, demo
// mode stripped) — calculateStreak is pure logic, copied verbatim.
import { supabase } from './supabaseClient'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export async function getChallenges() {
  const { data, error } = await supabase.from('challenges').select('*').order('frequency').order('title')
  if (error) return []
  return data
}

export async function getCompletions(userId, { sinceDays = 60 } = {}) {
  const since = new Date()
  since.setDate(since.getDate() - sinceDays)
  const { data, error } = await supabase
    .from('challenge_completions')
    .select('*')
    .eq('user_id', userId)
    .gte('completed_date', since.toISOString().slice(0, 10))
  if (error) return []
  return data
}

export async function toggleCompletion(userId, challengeId, isDone) {
  if (isDone) {
    const { error } = await supabase
      .from('challenge_completions')
      .delete()
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .eq('completed_date', todayStr())
    return { error }
  }
  const { error } = await supabase.from('challenge_completions').insert({ user_id: userId, challenge_id: challengeId, completed_date: todayStr() })
  return { error }
}

/** Current consecutive-day streak for a daily challenge, ending today or yesterday. */
export function calculateStreak(completions, challengeId) {
  const dates = new Set(completions.filter((c) => c.challenge_id === challengeId).map((c) => c.completed_date))
  let streak = 0
  const cursor = new Date()
  if (!dates.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1)
  while (dates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
