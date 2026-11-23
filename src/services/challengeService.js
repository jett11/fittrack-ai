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

// No 0/O/1/I — avoids ambiguous codes when read aloud or handwritten.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateJoinCode(length = 6) {
  let code = ''
  for (let i = 0; i < length; i++) code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
  return code
}

export async function createChallengeGroup(userId, { name, challengeId }) {
  if (isDemoMode) return { error: DEMO_ERROR }
  for (let attempt = 0; attempt < 5; attempt++) {
    const joinCode = generateJoinCode()
    const { data, error } = await supabase
      .from('challenge_groups')
      .insert({ name, challenge_id: challengeId, join_code: joinCode, created_by: userId })
      .select()
      .single()
    if (!error) {
      await supabase.from('challenge_group_members').insert({ group_id: data.id, user_id: userId })
      return { data }
    }
    if (error.code !== '23505') return { error } // not a unique-violation on join_code — give up
  }
  return { error: { message: 'Could not generate a unique join code — try again.' } }
}

export async function joinChallengeGroupByCode(userId, joinCode) {
  if (isDemoMode) return { error: DEMO_ERROR }
  const code = joinCode.trim().toUpperCase()
  const { data: group, error: findError } = await supabase
    .from('challenge_groups')
    .select('*, challenges(title)')
    .eq('join_code', code)
    .maybeSingle()
  if (findError || !group) return { error: { message: 'No group found with that code.' } }

  const { error } = await supabase
    .from('challenge_group_members')
    .upsert({ group_id: group.id, user_id: userId }, { onConflict: 'group_id,user_id' })
  if (error) return { error }
  return { data: group }
}

export async function getMyGroups(userId) {
  if (isDemoMode) return []
  const { data, error } = await supabase
    .from('challenge_group_members')
    .select('joined_at, challenge_groups(id, name, join_code, challenge_id, challenges(title))')
    .eq('user_id', userId)
  if (error) return []
  return data.map((row) => ({ ...row.challenge_groups, joined_at: row.joined_at }))
}

export async function getGroupLeaderboard(groupId) {
  if (isDemoMode) return []
  const { data, error } = await supabase.rpc('get_group_leaderboard', { p_group_id: groupId })
  if (error) return []
  return data
}

export async function leaveGroup(groupId, userId) {
  if (isDemoMode) return { error: DEMO_ERROR }
  const { error } = await supabase.from('challenge_group_members').delete().eq('group_id', groupId).eq('user_id', userId)
  return { error }
}
