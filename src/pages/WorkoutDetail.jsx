import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Trash2, Play } from 'lucide-react'
import Container from '../components/ui/Container'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Poster from '../components/ui/Poster'
import { useAuth } from '../hooks/useAuth'
import { getWorkoutWithExercises, startSession, deleteRoutine } from '../services/workoutService'
import { getWorkoutPosterUrl } from '../data/workoutPosters'

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
    <Container className="max-w-2xl py-6 sm:py-8">
      <Link to="/workouts" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text">
        <ArrowLeft size={15} /> Back
      </Link>

      <Card className="overflow-hidden p-0">
        <Poster src={getWorkoutPosterUrl(workout)} aspect="4/3">
          <div className="flex h-full flex-col justify-between p-4">
            <div className="flex items-start justify-end">
              {!workout.is_template && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex items-center gap-1.5 rounded-full bg-black/35 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black/50"
                >
                  <Trash2 size={13} /> Delete
                </button>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white drop-shadow-sm">{workout.name}</h2>
              <p className="mt-1 text-sm text-white/80">
                {workout.workout_exercises.length} exercises &middot; {workout.location}
              </p>
            </div>
          </div>
        </Poster>
      </Card>

      <Button onClick={handleStart} disabled={starting} size="lg" className="mt-4 w-full sm:w-auto">
        <Play size={16} fill="currentColor" /> {starting ? 'Starting…' : 'Start this workout'}
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
