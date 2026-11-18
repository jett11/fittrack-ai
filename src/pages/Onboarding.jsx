import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, Building2, Shuffle } from 'lucide-react'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import ChoiceCard from '../components/ui/ChoiceCard'
import Chip from '../components/ui/Chip'
import { useAuth } from '../hooks/useAuth'
import {
  sexOptions,
  goalOptions,
  experienceOptions,
  activityOptions,
  locationOptions,
  equipmentOptions,
  dietOptions,
} from '../data/onboardingOptions'

const locationIcons = { home: Home, gym: Building2, both: Shuffle }

const STEPS = ['Basics', 'Your goal', 'Training', 'Diet & budget']

export default function Onboarding() {
  const { saveProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState({
    full_name: '',
    age: '',
    biological_sex: '',
    height_cm: '',
    current_weight_kg: '',
    target_weight_kg: '',
    fitness_goal: '',
    experience_level: '',
    activity_level: '',
    workout_location: '',
    equipment: [],
    dietary_preference: '',
    daily_food_budget: '',
  })

  const set = (key, value) => setData((d) => ({ ...d, [key]: value }))

  const toggleEquipment = (item) => {
    setData((d) => ({
      ...d,
      equipment: d.equipment.includes(item)
        ? d.equipment.filter((e) => e !== item)
        : [...d.equipment, item],
    }))
  }

  const canContinue = () => {
    if (step === 0) return data.full_name.trim() && data.age && data.height_cm && data.current_weight_kg
    if (step === 1) return data.fitness_goal && data.experience_level && data.activity_level
    if (step === 2) return data.workout_location
    return true
  }

  const finish = async () => {
    setSaving(true)
    const payload = {
      full_name: data.full_name.trim(),
      age: data.age ? Number(data.age) : null,
      biological_sex: data.biological_sex || 'unspecified',
      height_cm: data.height_cm ? Number(data.height_cm) : null,
      current_weight_kg: data.current_weight_kg ? Number(data.current_weight_kg) : null,
      target_weight_kg: data.target_weight_kg ? Number(data.target_weight_kg) : null,
      fitness_goal: data.fitness_goal,
      experience_level: data.experience_level,
      activity_level: data.activity_level,
      workout_location: data.workout_location,
      equipment: data.equipment,
      dietary_preference: data.dietary_preference || null,
      daily_food_budget: data.daily_food_budget ? Number(data.daily_food_budget) : null,
      onboarding_completed: true,
    }
    const { error } = await saveProfile(payload)
    setSaving(false)
    if (!error) navigate('/dashboard')
  }

  const next = () => (step === STEPS.length - 1 ? finish() : setStep((s) => s + 1))
  const back = () => setStep((s) => Math.max(0, s - 1))

  return (
    <Card className="w-full max-w-lg p-7">
      <div className="mb-6">
        <p className="text-sm font-semibold text-primary">
          Step {step + 1} of {STEPS.length} &middot; {STEPS[step]}
        </p>
        <div className="mt-2 flex gap-1.5">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-primary' : 'bg-surface-2'}`}
            />
          ))}
        </div>
      </div>

      {step === 0 && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-text-secondary">
            We use this to calculate your personal calorie and protein targets. Nothing here is
            shared publicly.
          </p>
          <Input label="Full name" value={data.full_name} onChange={(e) => set('full_name', e.target.value)} />
          <div className="grid grid-cols-3 gap-3">
            <Input label="Age" type="number" min="10" max="100" value={data.age} onChange={(e) => set('age', e.target.value)} />
            <Input label="Height (cm)" type="number" value={data.height_cm} onChange={(e) => set('height_cm', e.target.value)} />
            <Input label="Weight (kg)" type="number" value={data.current_weight_kg} onChange={(e) => set('current_weight_kg', e.target.value)} />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-text">
              Biological sex <span className="font-normal text-text-secondary">(used only for calorie math accuracy)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {sexOptions.map((o) => (
                <Chip key={o.value} selected={data.biological_sex === o.value} onClick={() => set('biological_sex', o.value)}>
                  {o.label}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-5">
          <div>
            <p className="mb-2 text-sm font-semibold text-text">What&rsquo;s your main goal?</p>
            <div className="grid gap-2.5">
              {goalOptions.map((o) => (
                <ChoiceCard key={o.value} {...o} selected={data.fitness_goal === o.value} onClick={() => set('fitness_goal', o.value)} />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-text">Experience level</p>
            <div className="grid gap-2.5">
              {experienceOptions.map((o) => (
                <ChoiceCard key={o.value} {...o} selected={data.experience_level === o.value} onClick={() => set('experience_level', o.value)} />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-text">Daily activity level</p>
            <div className="grid gap-2.5">
              {activityOptions.map((o) => (
                <ChoiceCard key={o.value} {...o} selected={data.activity_level === o.value} onClick={() => set('activity_level', o.value)} />
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-5">
          <div>
            <p className="mb-2 text-sm font-semibold text-text">Where do you train?</p>
            <div className="grid gap-2.5">
              {locationOptions.map((o) => (
                <ChoiceCard
                  key={o.value}
                  {...o}
                  icon={locationIcons[o.value]}
                  selected={data.workout_location === o.value}
                  onClick={() => set('workout_location', o.value)}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-text">
              What equipment do you have? <span className="font-normal text-text-secondary">(optional)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {equipmentOptions.map((item) => (
                <Chip key={item} selected={data.equipment.includes(item)} onClick={() => toggleEquipment(item)}>
                  {item}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-5">
          <div>
            <p className="mb-2 text-sm font-semibold text-text">
              Dietary preference <span className="font-normal text-text-secondary">(optional)</span>
            </p>
            <div className="grid gap-2.5">
              {dietOptions.map((o) => (
                <ChoiceCard key={o.value} {...o} selected={data.dietary_preference === o.value} onClick={() => set('dietary_preference', o.value)} />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Daily food budget (₹, optional)"
              type="number"
              value={data.daily_food_budget}
              onChange={(e) => set('daily_food_budget', e.target.value)}
            />
            <Input
              label="Target weight (kg, optional)"
              type="number"
              value={data.target_weight_kg}
              onChange={(e) => set('target_weight_kg', e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="mt-7 flex items-center justify-between">
        <Button variant="ghost" onClick={back} disabled={step === 0 || saving}>
          Back
        </Button>
        <Button onClick={next} disabled={!canContinue() || saving}>
          {step === STEPS.length - 1 ? (saving ? 'Saving…' : 'Finish') : 'Continue'}
        </Button>
      </div>
    </Card>
  )
}
