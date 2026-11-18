import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Dumbbell, ArrowLeft, Trash2 } from 'lucide-react'
import Container from '../components/ui/Container'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { getWorkoutWithExercises, startSession, deleteRoutine } from '../services/workoutService'

export default function WorkoutDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [workout, setWorkout] = useState(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    getWorkoutWithExercises(id).then((data) => {
      setWorkout(data)
      setLoading(false)
    })
  }, [id])

  const handleStart = async () => {
    setStarting(true)
    const { data, error } = await startSession(user.id, id)
    setStarting(false)
    if (!error) navigate('/workouts/session')
  }

  const handleDelete = async () => {
    if (!confirm('Delete this routine? This cannot be undone.')) return
    await deleteRoutine(id)
    navigate('/workouts')
  }

  if (loading) {
    return (
      <Container className="max-w-2xl py-10">
        <p className="text-sm text-text-secondary">Loading…</p>
      </Container>
    )
  }

  if (!workout) {
    return (
      <Container className="max-w-2xl py-10">
        <p className="text-sm text-text-secondary">Workout not found.</p>
        <Button as={Link} to="/workouts" size="sm" variant="secondary" className="mt-3">
          Back to workouts
        </Button>
      </Container>
    )
  }

  return (
    <Container className="max-w-2xl py-8">
      <Link to="/workouts" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text">
        <ArrowLeft size={15} /> Back
      </Link>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-text">{workout.name}</h2>
          <p className="mt-1 text-sm text-text-secondary">
            {workout.workout_exercises.length} exercises &middot; {workout.location}
          </p>
        </div>
        {!workout.is_template && (
          <Button variant="ghost" size="sm" onClick={handleDelete}>
            <Trash2 size={14} /> Delete
          </Button>
        )}
      </div>

      <Button onClick={handleStart} disabled={starting} size="lg" className="mt-5 w-full sm:w-auto">
        <Dumbbell size={16} /> {starting ? 'Starting…' : 'Start this workout'}
      </Button>

      <div className="mt-6 flex flex-col gap-2.5">
        {workout.workout_exercises.map((we, i) => (
          <Card key={we.id} className="flex items-center gap-3 p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-2 text-sm font-bold text-text-secondary">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text">{we.exercises.name}</p>
              <p className="text-xs text-text-secondary">
                {we.target_sets} sets &times; {we.target_reps} &middot; rest {we.rest_seconds}s
              </p>
            </div>
          </Card>
        ))}
      </div>
    </Container>
  )
}
