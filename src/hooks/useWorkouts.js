import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { isDemoMode } from '../services/supabaseClient'
import { getTemplates, getMyRoutines, getWorkoutHistory } from '../services/workoutService'

export function useWorkouts() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState([])
  const [routines, setRoutines] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    if (isDemoMode) {
      setTemplates([])
      setRoutines([])
      setHistory([])
      setLoading(false)
      return
    }
    const [t, r, h] = await Promise.all([getTemplates(), getMyRoutines(user.id), getWorkoutHistory(user.id)])
    setTemplates(t)
    setRoutines(r)
    setHistory(h)
    setLoading(false)
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  return { templates, routines, history, loading, refresh: load }
}
