// Same queries/table shapes as the web app's nutritionService.js, ported
// without the web-only demo-mode branches.
import { supabase } from './supabaseClient'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export async function searchFoods(query = '') {
  let q = supabase.from('foods').select('*').order('name')
  if (query) q = q.ilike('name', `%${query}%`)
  const { data, error } = await q
  if (error) return []
  return data
}

export async function getTodayMeals(userId) {
  const { data, error } = await supabase
    .from('meal_logs')
    .select('*, foods(name, serving_size)')
    .eq('user_id', userId)
    .eq('logged_date', todayStr())
    .order('created_at')
  if (error) return []
  return data
}

/**
 * @param {string} userId
 * @param {{ foodId?: string, customFoodName?: string, mealType: string, quantity: number, calories: number, protein_g: number, carbs_g: number, fat_g: number }} entry
 */
export async function logMeal(userId, { foodId, customFoodName, mealType, quantity, calories, protein_g, carbs_g, fat_g }) {
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
  const { error } = await supabase.from('meal_logs').delete().eq('id', id)
  return { error }
}
