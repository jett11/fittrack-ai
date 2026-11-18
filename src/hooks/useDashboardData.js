import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { isDemoMode } from '../services/supabaseClient'
import {
  getTodayWater,
  setTodayWater,
  getTodayMealTotals,
  getTodayWorkoutSession,
  getWeeklyConsistency,
  getWeightHistory,
  buildEmptyWeek,
} from '../services/dashboardService'

const EMPTY = {
  water: 0,
  meals: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, count: 0 },
  todayWorkout: null,
  weeklyConsistency: buildEmptyWeek(),
  weightHistory: [],
}

export function useDashboardData() {
  const { user } = useAuth()
  const [data, setData] = useState(EMPTY)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)

    if (isDemoMode) {
      setData(EMPTY)
      setLoading(false)
      return
    }

    const [water, meals, todayWorkout, weeklyConsistency, weightHistory] = await Promise.all([
      getTodayWater(user.id),
      getTodayMealTotals(user.id),
      getTodayWorkoutSession(user.id),
      getWeeklyConsistency(user.id),
      getWeightHistory(user.id),
    ])

    setData({ water, meals, todayWorkout, weeklyConsistency, weightHistory })
    setLoading(false)
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const updateWater = async (glasses) => {
    setData((d) => ({ ...d, water: glasses }))
    if (!isDemoMode && user) await setTodayWater(user.id, glasses)
  }

  return { ...data, loading, refresh: load, updateWater }
}
