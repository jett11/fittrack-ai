import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Circle, Flag, TrendingUp, PartyPopper } from 'lucide-react'
import Container from '../components/ui/Container'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import RestTimer from '../components/workouts/RestTimer'
import WorkoutShareCard from '../components/workouts/WorkoutShareCard'
import { useAuth } from '../hooks/useAuth'
import {
  getActiveSession,
  getSessionLogs,
  logSet,
  completeSession,
  abandonSession,
  getLastSetsForExercises,
} from '../services/workoutService'
import { suggestProgression } from '../utils/progressiveOverload'

export default function WorkoutSession() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [logs, setLogs] = useState({})
  const [lastSets, setLastSets] = useState({})
  const [loading, setLoading] = useState(true)
  const [resting, setResting] = useState(null)
  const [finishing, setFinishing] = useState(false)
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    getActiveSession(user.id).then(async (s) => {
      if (!s) {
        setLoading(false)
        return
      }
      const existingLogs = await getSessionLogs(s.id)
      const map = {}
      existingLogs.forEach((l) => {
        map[`${l.exercise_id}-${l.set_number}`] = l
      })
      setSession(s)
      setLogs(map)
      setLoading(false)

      const exerciseIds = (s.workouts?.workout_exercises ?? []).map((we) => we.exercise_id)
      getLastSetsForExercises(exerciseIds, s.id).then(setLastSets)
    })
  }, [user.id])

  const handleLogSet = async (exerciseId, setNumber, reps, weight, restSeconds) => {
    const key = `${exerciseId}-${setNumber}`
    setLogs((l) => ({ ...l, [key]: { reps_completed: reps, weight_kg: weight, completed: true } }))
    await logSet(session.id, exerciseId, setNumber, { repsCompleted: reps, weightKg: weight, completed: true })
    if (restSeconds) setResting(restSeconds)
  }

  const handleFinish = async () => {
    setFinishing(true)
    await completeSession(session.id)
    const completedLogs = Object.values(logs).filter((l) => l.completed)
    const durationMin = Math.max(1, Math.round((Date.now() - new Date(session.started_at)) / 60000))
    const volumeKg = Math.round(
      completedLogs.reduce((sum, l) => sum + (Number(l.weight_kg) || 0) * (Number(l.reps_completed) || 0), 0)
    )
    setSummary({
      name: session.workouts?.name ?? 'Workout',
      durationMin,
      totalSets: completedLogs.length,
      volumeKg,
    })
    setFinishing(false)
  }

  const handleAbandon = async () => {
    if (!confirm('End this workout without finishing? Your logged sets will still be saved.')) return
    await abandonSession(session.id)
    navigate('/workouts')
  }

  if (loading) {
    return (
      <Container className="max-w-2xl py-10">
        <p className="text-sm text-text-secondary">Loading…</p>
      </Container>
    )
  }

  if (!session) {
    return (
      <Container className="max-w-2xl py-10 text-center">
        <p className="text-sm text-text-secondary">No workout in progress right now.</p>
        <Button onClick={() => navigate('/workouts')} size="sm" className="mt-3">
          Browse workouts
        </Button>
      </Container>
    )
  }

  if (summary) {
    return (
      <Container className="max-w-2xl py-10 text-center">
        <PartyPopper size={32} className="mx-auto text-primary" />
        <h2 className="mt-3 text-2xl font-extrabold text-text">Nice work!</h2>
        <p className="mt-1 text-sm text-text-secondary">
          {summary.durationMin} min &middot; {summary.totalSets} sets &middot; {summary.volumeKg}kg lifted
        </p>
        <div className="mt-6">
          <WorkoutShareCard {...summary} />
        </div>
        <Button onClick={() => navigate('/dashboard')} size="lg" variant="secondary" className="mt-6 w-full sm:w-auto">
          Done
        </Button>
      </Container>
    )
  }

  const exercises = session.workouts?.workout_exercises ?? []
  const totalSets = exercises.reduce((sum, we) => sum + we.target_sets, 0)
  const doneSets = Object.values(logs).filter((l) => l.completed).length
  const progressPct = totalSets ? Math.round((doneSets / totalSets) * 100) : 0

  return (
    <Container className="max-w-2xl py-6 pb-28">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-text">{session.workouts?.name ?? 'Workout'}</h2>
        <Button variant="ghost" size="sm" onClick={handleAbandon}>
          End early
        </Button>
      </div>

      <div className="mb-5">
        <div className="mb-1 flex items-center justify-between text-xs text-text-secondary">
          <span>Workout progress</span>
          <span className="font-semibold text-text">
            {doneSets}/{totalSets} sets
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {exercises.map((we) => {
          const suggestion = suggestProgression(lastSets[we.exercise_id])
          return (
          <Card key={we.id} className="p-5">
            <p className="font-bold text-text">{we.exercises.name}</p>
            <p className="text-xs text-text-secondary">
              Target: {we.target_sets} sets &times; {we.target_reps}
            </p>
            {suggestion && (
              <p className="mt-1.5 mb-1 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                <TrendingUp size={13} /> {suggestion}
              </p>
            )}
            <div className="mt-3 flex flex-col gap-2">
              {Array.from({ length: we.target_sets }).map((_, i) => {
                const setNumber = i + 1
                const key = `${we.exercise_id}-${setNumber}`
                const existing = logs[key]
                return (
                  <SetRow
                    key={setNumber}
                    setNumber={setNumber}
                    existing={existing}
                    onLog={(reps, weight) => handleLogSet(we.exercise_id, setNumber, reps, weight, we.rest_seconds)}
                  />
                )
              })}
            </div>
          </Card>
          )
        })}
      </div>

      <Button onClick={handleFinish} disabled={finishing} size="lg" className="mt-6 w-full">
        <Flag size={16} /> {finishing ? 'Finishing…' : 'Finish workout'}
      </Button>

      {resting && <RestTimer seconds={resting} onDismiss={() => setResting(null)} />}
    </Container>
  )
}

function SetRow({ setNumber, existing, onLog }) {
  const [reps, setReps] = useState(existing?.reps_completed ?? '')
  const [weight, setWeight] = useState(existing?.weight_kg ?? '')
  const done = !!existing?.completed

  return (
    <div className="flex items-center gap-2">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-bold text-text-secondary">
        {setNumber}
      </span>
      <Input
        type="number"
        placeholder="reps"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        className="w-20"
      />
      <Input
        type="number"
        placeholder="kg"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        className="w-20"
      />
      <button
        type="button"
        onClick={() => onLog(reps ? Number(reps) : null, weight ? Number(weight) : null)}
        className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-full"
      >
        {done ? <CheckCircle2 size={22} className="text-primary" /> : <Circle size={22} className="text-text-secondary" />}
      </button>
    </div>
  )
}
