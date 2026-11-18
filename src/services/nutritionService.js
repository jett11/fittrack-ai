import { supabase, isDemoMode } from './supabaseClient'

const DEMO_ERROR = { message: 'This isn’t available in demo mode — connect a real account.' }

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export async function searchFoods(query = '') {
  if (isDemoMode) return []
  let q = supabase.from('foods').select('*').order('name')
  if (query) q = q.ilike('name', `%${query}%`)
  const { data, error } = await q
  if (error) return []
  return data
}

export async function getTodayMeals(userId) {
  if (isDemoMode) return []
  const { data, error } = await supabase
    .from('meal_logs')
    .select('*, foods(name, serving_size)')
    .eq('user_id', userId)
    .eq('logged_date', todayStr())
    .order('created_at')
  if (error) return []
  return data
}

export async function logMeal(userId, { foodId, customFoodName, mealType, quantity, calories, protein_g, carbs_g, fat_g }) {
  if (isDemoMode) return { error: DEMO_ERROR }
  const { data, error } = await supabase
    .from('meal_logs')
    .insert({
      user_id: userId,
      food_id: foodId ?? null,
      custom_food_name: customFoodName ?? null,
      meal_type: mealType,
      quantity,
      calories,
      protein_g,
      carbs_g,
      fat_g,
      logged_date: todayStr(),
    })
    .select()
    .single()
  return { data, error }
}

export async function deleteMealLog(id) {
  if (isDemoMode) return { error: DEMO_ERROR }
  const { error } = await supabase.from('meal_logs').delete().eq('id', id)
  return { error }
}

/**
 * Deterministic, non-AI budget meal suggestion: greedily picks foods that
 * respect the dietary preference and maximize protein per rupee within budget.
 */
export async function suggestBudgetMeals({ budget, dietaryPreference }) {
  if (isDemoMode) return { items: [], totalCost: 0, totalCalories: 0, totalProtein: 0 }
  let q = supabase.from('foods').select('*').not('price_inr', 'is', null)
  if (dietaryPreference === 'vegetarian') q = q.eq('is_veg', true)
  if (dietaryPreference === 'vegan') q = q.eq('is_veg', true).neq('category', 'Dairy')
  const { data: foods, error } = await q
  if (error || !foods?.length) return { items: [], totalCost: 0, totalCalories: 0, totalProtein: 0 }

  const ranked = [...foods].sort((a, b) => b.protein_g / b.price_inr - a.protein_g / a.price_inr)

  const items = []
  let remaining = budget
  let totalCalories = 0
  let totalProtein = 0
  let totalCost = 0

  for (const food of ranked) {
    const maxAffordable = Math.floor(remaining / food.price_inr)
    if (maxAffordable < 1) continue
    const qty = Math.min(maxAffordable, 3)
    items.push({ food, quantity: qty, cost: qty * food.price_inr })
    remaining -= qty * food.price_inr
    totalCost += qty * food.price_inr
    totalCalories += qty * food.calories
    totalProtein += qty * food.protein_g
    if (remaining < 3) break
  }

  return { items, totalCost, totalCalories, totalProtein, remaining }
}
