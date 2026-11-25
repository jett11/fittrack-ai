import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { getChallenges, getCompletions, toggleCompletion } from '../services/challengeService'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function useChallenges() {
  const { user } = useAuth()
  const [challenges, setChallenges] = useState<any[]>([])
  const [completions, setCompletions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const [c, comp] = await Promise.all([getChallenges(), getCompletions(user.id)])
    setChallenges(c)
    setCompletions(comp)
    setLoading(false)
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const toggle = async (challengeId: string) => {
    if (!user) return
    const today = todayStr()
    const isDone = completions.some((c) => c.challenge_id === challengeId && c.completed_date === today)

    setCompletions((prev) =>
      isDone
        ? prev.filter((c) => !(c.challenge_id === challengeId && c.completed_date === today))
        : [...prev, { challenge_id: challengeId, completed_date: today, user_id: user.id }]
    )
    await toggleCompletion(user.id, challengeId, isDone)
  }

  return { challenges, completions, loading, toggle, refresh: load }
}
