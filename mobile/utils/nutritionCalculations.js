// All calculations are local estimates for everyday tracking — not medical advice.

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
}

const GOAL_ADJUSTMENT = {
  fat_loss: -500,
  muscle_gain: 300,
  general_fitness: 0,
}

/** Mifflin-St Jeor basal metabolic rate, in kcal/day. */
export function calculateBMR({ biological_sex, age, height_cm, current_weight_kg }) {
  if (!age || !height_cm || !current_weight_kg) return null
  const base = 10 * current_weight_kg + 6.25 * height_cm - 5 * age
  if (biological_sex === 'male') return Math.round(base + 5)
  if (biological_sex === 'female') return Math.round(base - 161)
  // Unspecified: average of the male/female offsets.
  return Math.round(base - 78)
}

/** Total daily energy expenditure, in kcal/day. */
export function calculateTDEE(profile) {
  const bmr = calculateBMR(profile)
  if (!bmr) return null
  const multiplier = ACTIVITY_MULTIPLIERS[profile.activity_level] ?? 1.375
  return Math.round(bmr * multiplier)
}

/** Daily calorie target adjusted for the user's stated goal. */
export function calculateCalorieTarget(profile) {
  const tdee = calculateTDEE(profile)
  if (!tdee) return null
  const adjustment = GOAL_ADJUSTMENT[profile.fitness_goal] ?? 0
  return Math.max(1200, tdee + adjustment)
}

/** Daily protein target in grams — roughly 1.6-2.2g/kg for training adults. */
export function calculateProteinTarget(profile) {
  if (!profile.current_weight_kg) return null
  const gramsPerKg = profile.fitness_goal === 'fat_loss' ? 2.0 : profile.fitness_goal === 'muscle_gain' ? 1.9 : 1.6
  return Math.round(profile.current_weight_kg * gramsPerKg)
}

export function calculateBMI({ height_cm, current_weight_kg }) {
  if (!height_cm || !current_weight_kg) return null
  const heightM = height_cm / 100
  return Math.round((current_weight_kg / (heightM * heightM)) * 10) / 10
}

export function bmiCategory(bmi) {
  if (bmi == null) return null
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Healthy range'
  if (bmi < 30) return 'Overweight'
  return 'Obese range'
}
