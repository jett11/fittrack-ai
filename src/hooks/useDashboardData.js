import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { isDemoMode } from '../services/supabaseClient'
import {
  getTodayWater,
  setTodayWater,
  getTodayCheckin,
  setTodayCheckin,
  getTodayMealTotals,
  getTodayWorkoutSession,
  getWeeklyConsistency,
  getWeeklyCalories,
  getWeightHistory,
  buildEmptyWeek,
} from '../services/dashboardService'

const EMPTY = {
  water: 0,
  checkin: { sleepHours: null, mood: null, energy: null },
  meals: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, count: 0 },
  todayWorkout: null,
  weeklyConsistency: buildEmptyWeek(),
  weeklyCalories: buildEmptyWeek().map((d) => ({ ...d, calories: 0 })),
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

    const [water, checkin, meals, todayWorkout, weeklyConsistency, weeklyCalories, weightHistory] = await Promise.all([
      getTodayWater(user.id),
      getTodayCheckin(user.id),
      getTodayMealTotals(user.id),
      getTodayWorkoutSession(user.id),
      getWeeklyConsistency(user.id),
      getWeeklyCalories(user.id),
      getWeightHistory(user.id),
    ])

    setData({ water, checkin, meals, todayWorkout, weeklyConsistency, weeklyCalories, weightHistory })
    setLoading(false)
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const updateWater = async (glasses) => {
    setData((d) => ({ ...d, water: glasses }))
    if (!isDemoMode && user) await setTodayWater(user.id, glasses)
  }

  const updateCheckin = async (patch) => {
    setData((d) => {
      const next = { ...d.checkin, ...patch }
      if (!isDemoMode && user) setTodayCheckin(user.id, next)
      return { ...d, checkin: next }
    })
  }

  return { ...data, loading, refresh: load, updateWater, updateCheckin }
}
