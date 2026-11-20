import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { isDemoMode } from '../services/supabaseClient'
import { getWeeklyCalories } from '../services/dashboardService'
import { getTodayMeals } from '../services/nutritionService'
import { getWorkoutAnalytics } from '../services/workoutService'
import { getMeasurementHistory } from '../services/transformationService'
import { calculateProteinTarget } from '../utils/nutritionCalculations'
import { buildInsights } from '../services/insightsService'

const EMPTY = { nutrition: [], workout: [], progress: [] }

export function useInsights() {
  const { user, profile } = useAuth()
  const [insights, setInsights] = useState(EMPTY)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemoMode || !user) {
      setInsights(EMPTY)
      setLoading(false)
      return
    }
    setLoading(true)
    Promise.all([
      getWeeklyCalories(user.id),
      getTodayMeals(user.id),
      getWorkoutAnalytics(user.id),
      getMeasurementHistory(user.id),
    ]).then(([weeklyNutrition, todayMeals, workoutAnalytics, measurementHistory]) => {
      setInsights(
        buildInsights({
          profile,
          proteinTarget: profile ? calculateProteinTarget(profile) : null,
          weeklyNutrition,
          todayMeals,
          workoutAnalytics,
          measurementHistory,
        })
      )
      setLoading(false)
    })
  }, [user, profile])

  return { insights, loading }
}
