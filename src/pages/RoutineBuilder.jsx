import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Container from '../components/ui/Container'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Chip from '../components/ui/Chip'
import ExerciseLibrary from '../components/workouts/ExerciseLibrary'
import { useAuth } from '../hooks/useAuth'
import { createRoutine } from '../services/workoutService'
import { goalOptions, experienceOptions, locationOptions } from '../data/onboardingOptions'

export default function RoutineBuilder() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('')
  const [level, setLevel] = useState('')
  const [location, setLocation] = useState('')
  const [picked, setPicked] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const togglePick = (ex) => {
    setPicked((p) => (p.find((e) => e.id === ex.id) ? p.filter((e) => e.id !== ex.id) : [...p, ex]))
  }

  const handleSave = async () => {
    setError('')
    if (!name.trim()) return setError('Give your routine a name.')
    if (picked.length === 0) return setError('Pick at least one exercise.')
    setSaving(true)
    const { data, error: saveError } = await createRoutine(user.id, {
      name: name.trim(),
      goal: goal || null,
      level: level || null,
      location: location || null,
      exerciseIds: picked.map((e) => e.id),
    })
    setSaving(false)
    if (saveError) return setError(saveError.message)
    navigate(`/workouts/${data.id}`)
  }

  return (
    <Container className="max-w-2xl py-8">
      <Link to="/workouts" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text">
        <ArrowLeft size={15} /> Back
      </Link>

      <h2 className="text-2xl font-extrabold text-text">Build a routine</h2>

      <Card className="mt-5 flex flex-col gap-4 p-5">
        <Input label="Routine name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. My Tuesday workout" />

        <div>
          <p className="mb-2 text-sm font-semibold text-text">Goal (optional)</p>
          <div className="flex flex-wrap gap-2">
            {goalOptions.map((o) => (
              <Chip key={o.value} selected={goal === o.value} onClick={() => setGoal(goal === o.value ? '' : o.value)}>
                {o.title}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-text">Level (optional)</p>
          <div className="flex flex-wrap gap-2">
            {experienceOptions.map((o) => (
              <Chip key={o.value} selected={level === o.value} onClick={() => setLevel(level === o.value ? '' : o.value)}>
                {o.title}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-text">Location (optional)</p>
          <div className="flex flex-wrap gap-2">
            {locationOptions.map((o) => (
              <Chip key={o.value} selected={location === o.value} onClick={() => setLocation(location === o.value ? '' : o.value)}>
                {o.title}
              </Chip>
            ))}
          </div>
        </div>
      </Card>

      <p className="mt-6 mb-3 text-sm font-semibold text-text">
        Pick exercises <span className="font-normal text-text-secondary">({picked.length} selected)</span>
      </p>
      <ExerciseLibrary onPick={togglePick} pickedIds={picked.map((e) => e.id)} />

      {error && <p className="mt-4 text-sm font-medium text-danger">{error}</p>}

      <Button onClick={handleSave} disabled={saving} size="lg" className="mt-6 w-full sm:w-auto">
        {saving ? 'Saving…' : 'Save routine'}
      </Button>
    </Container>
  )
}
