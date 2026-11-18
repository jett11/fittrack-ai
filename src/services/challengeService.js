import { supabase, isDemoMode } from './supabaseClient'

const DEMO_ERROR = { message: 'This isn’t available in demo mode — connect a real account.' }

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export async function getChallenges() {
  if (isDemoMode) return []
  const { data, error } = await supabase.from('challenges').select('*').order('frequency').order('title')
  if (error) return []
  return data
}

export async function getCompletions(userId, { sinceDays = 60 } = {}) {
  if (isDemoMode) return []
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
  if (isDemoMode) return { error: DEMO_ERROR }
  if (isDone) {
    const { error } = await supabase
      .from('challenge_completions')
      .delete()
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .eq('completed_date', todayStr())
    return { error }
  }
  const { error } = await supabase
    .from('challenge_completions')
    .insert({ user_id: userId, challenge_id: challengeId, completed_date: todayStr() })
  return { error }
}

/** Current consecutive-day streak for a daily challenge, ending today or yesterday. */
export function calculateStreak(completions, challengeId) {
  const dates = new Set(completions.filter((c) => c.challenge_id === challengeId).map((c) => c.completed_date))
  let streak = 0
  const cursor = new Date()
  // If today isn't done yet, streak counts up to yesterday so it doesn't flicker to 0 before you check in.
  if (!dates.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1)
  while (dates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function completionsThisWeek(completions, challengeId) {
  const since = new Date()
  since.setDate(since.getDate() - 6)
  const sinceStr = since.toISOString().slice(0, 10)
  return completions.filter((c) => c.challenge_id === challengeId && c.completed_date >= sinceStr).length
}

const BADGE_THRESHOLDS = [
  { days: 3, label: '3-day streak', icon: '🔥' },
  { days: 7, label: '7-day streak', icon: '⭐' },
  { days: 30, label: '30-day streak', icon: '🏆' },
]

export function earnedBadges(bestStreak) {
  return BADGE_THRESHOLDS.filter((b) => bestStreak >= b.days)
}
