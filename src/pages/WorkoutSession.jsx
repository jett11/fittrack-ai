import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Circle, Flag } from 'lucide-react'
import Container from '../components/ui/Container'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import RestTimer from '../components/workouts/RestTimer'
import { useAuth } from '../hooks/useAuth'
import { getActiveSession, getSessionLogs, logSet, completeSession, abandonSession } from '../services/workoutService'

export default function WorkoutSession() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [logs, setLogs] = useState({})
  const [loading, setLoading] = useState(true)
  const [resting, setResting] = useState(null)
  const [finishing, setFinishing] = useState(false)

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
    navigate('/dashboard')
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

  const exercises = session.workouts?.workout_exercises ?? []

  return (
    <Container className="max-w-2xl py-6 pb-28">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-text">{session.workouts?.name ?? 'Workout'}</h2>
        <Button variant="ghost" size="sm" onClick={handleAbandon}>
          End early
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {exercises.map((we) => (
          <Card key={we.id} className="p-5">
            <p className="font-bold text-text">{we.exercises.name}</p>
            <p className="mb-3 text-xs text-text-secondary">
              Target: {we.target_sets} sets &times; {we.target_reps}
            </p>
            <div className="flex flex-col gap-2">
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
        ))}
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
