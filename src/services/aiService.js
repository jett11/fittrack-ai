import { supabase, isDemoMode } from './supabaseClient'

async function callAI(type, payload) {
  if (isDemoMode) return { error: { message: 'AI features aren’t available in demo mode.' } }
  const { data, error } = await supabase.functions.invoke('ai-generate', { body: { type, ...payload } })
  if (error || data?.error) {
    return { error: { message: data?.error ?? error?.message ?? 'The AI request failed.' } }
  }
  return { data }
}

export function generateRoutine(payload) {
  return callAI('routine', payload)
}

export function generateMealPlan(payload) {
  return callAI('meal-plan', payload)
}

export function generateInsights(payload) {
  return callAI('insights', payload)
}
