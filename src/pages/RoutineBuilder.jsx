import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Sparkles } from 'lucide-react'
import Container from '../components/ui/Container'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Chip from '../components/ui/Chip'
import PremiumGate from '../components/ui/PremiumGate'
import ExerciseLibrary from '../components/workouts/ExerciseLibrary'
import { useAuth } from '../hooks/useAuth'
import { createRoutine, searchExercises } from '../services/workoutService'
import { generateRoutine } from '../services/aiService'
import { goalOptions, experienceOptions, locationOptions } from '../data/onboardingOptions'

const DAYS_OPTIONS = [2, 3, 4, 5, 6]

export default function RoutineBuilder() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const isPremium = !!profile?.is_premium
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('')
  const [level, setLevel] = useState('')
  const [location, setLocation] = useState('')
  const [daysPerWeek, setDaysPerWeek] = useState('')
  const [picked, setPicked] = useState([])
  const [targets, setTargets] = useState({})
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [aiNote, setAiNote] = useState('')
  const [error, setError] = useState('')

  if (!isPremium) {
    return (
      <Container className="max-w-xl py-10">
        <PremiumGate
          title="Build your own routines"
          description="Custom routine building — including AI-generated routines — is a Premium feature."
        />
      </Container>
    )
  }

  const togglePick = (ex) => {
    setPicked((p) => (p.find((e) => e.id === ex.id) ? p.filter((e) => e.id !== ex.id) : [...p, ex]))
  }

  const handleGenerateAI = async () => {
    setError('')
    setAiNote('')
    setGenerating(true)
    const availableExercises = await searchExercises({ location })
    const { data, error: genError } = await generateRoutine({
      goal,
      level,
      location,
      daysPerWeek,
      availableExercises: availableExercises.map((e) => ({
        id: e.id,
        name: e.name,
        muscle_group: e.muscle_group,
        equipment: e.equipment,
        location: e.location,
      })),
    })
    setGenerating(false)
    if (genError) return setError(genError.message)

    const byId = new Map(availableExercises.map((e) => [e.id, e]))
    const resolved = data.exercises.map((x) => byId.get(x.exercise_id)).filter(Boolean)
    if (!resolved.length) return setError('The AI couldn’t pick valid exercises — try again.')

    setName(data.name || name)
    setPicked(resolved)
    const nextTargets = {}
    data.exercises.forEach((x) => {
      if (byId.has(x.exercise_id)) nextTargets[x.exercise_id] = { sets: x.sets, reps: x.reps, rest_seconds: x.rest_seconds }
    })
    setTargets(nextTargets)
    setAiNote('AI-generated — review the picks below, then save (or keep adjusting first).')
  }

  const handleSave = async () => {
    setError('')
    if (!name.trim()) return setError('Give your routine a name.')
    if (picked.length === 0) return setError('Pick at least one exercise.')
    setSaving(true)
    const items = picked.map((e) => ({ id: e.id, ...targets[e.id] }))
    const { data, error: saveError } = await createRoutine(user.id, {
      name: name.trim(),
      goal: goal || null,
      level: level || null,
      location: location || null,
      items,
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
        <div>
          <p className="mb-2 text-sm font-semibold text-text">Days per week (optional)</p>
          <div className="flex flex-wrap gap-2">
            {DAYS_OPTIONS.map((d) => (
              <Chip key={d} selected={daysPerWeek === d} onClick={() => setDaysPerWeek(daysPerWeek === d ? '' : d)}>
                {d}
              </Chip>
            ))}
          </div>
        </div>

        <Button onClick={handleGenerateAI} disabled={generating} variant="secondary" className="w-full sm:w-auto">
          <Sparkles size={16} /> {generating ? 'Generating…' : 'Generate with AI'}
        </Button>
        {aiNote && <p className="text-sm text-text-secondary">{aiNote}</p>}
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
