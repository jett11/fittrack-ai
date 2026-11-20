import { useEffect } from 'react'
import { useAuth } from './useAuth'
import { isDemoMode } from '../services/supabaseClient'
import { getNotificationPreference } from '../services/preferencesService'

const STORAGE_KEY = 'fittrack-reminder-shown-on'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Fires at most one browser notification per day, in the evening, if the
 * user has opted in and still has an open goal. Foreground-only (no
 * service worker push) — intentionally simple.
 */
export function useDailyReminder({ water, todayWorkout, loading }) {
  const { user } = useAuth()

  useEffect(() => {
    if (isDemoMode || !user || loading) return
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    if (new Date().getHours() < 18) return
    if (localStorage.getItem(STORAGE_KEY) === todayStr()) return

    const workoutDone = todayWorkout?.status === 'completed'
    const waterDone = water >= 8
    if (workoutDone && waterDone) return

    getNotificationPreference(user.id).then((enabled) => {
      if (!enabled) return
      const missing = []
      if (!waterDone) missing.push('water intake')
      if (!workoutDone) missing.push("today's workout")
      new Notification('FitTrack AI', { body: `Still time to log ${missing.join(' and ')} today.` })
      localStorage.setItem(STORAGE_KEY, todayStr())
    })
  }, [user, water, todayWorkout, loading])
}
