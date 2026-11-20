import { useEffect, useState } from 'react'
import Container from '../components/ui/Container'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Chip from '../components/ui/Chip'
import { useAuth } from '../hooks/useAuth'
import {
  sexOptions,
  goalOptions,
  experienceOptions,
  activityOptions,
  locationOptions,
  dietOptions,
  equipmentOptions,
} from '../data/onboardingOptions'

const fieldsFromProfile = (p) => ({
  full_name: p?.full_name ?? '',
  age: p?.age ?? '',
  biological_sex: p?.biological_sex ?? 'unspecified',
  height_cm: p?.height_cm ?? '',
  current_weight_kg: p?.current_weight_kg ?? '',
  target_weight_kg: p?.target_weight_kg ?? '',
  fitness_goal: p?.fitness_goal ?? '',
  experience_level: p?.experience_level ?? '',
  activity_level: p?.activity_level ?? '',
  workout_location: p?.workout_location ?? '',
  equipment: p?.equipment ?? [],
  weekly_workout_target: p?.weekly_workout_target ?? '',
  dietary_preference: p?.dietary_preference ?? '',
  daily_food_budget: p?.daily_food_budget ?? '',
})

export default function Profile() {
  const { profile, saveProfile } = useAuth()
  const [data, setData] = useState(fieldsFromProfile(profile))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => setData(fieldsFromProfile(profile)), [profile])

  const set = (key, value) => {
    setSaved(false)
    setData((d) => ({ ...d, [key]: value }))
  }

  const toggleEquipment = (item) => {
    setSaved(false)
    setData((d) => ({
      ...d,
      equipment: d.equipment.includes(item) ? d.equipment.filter((e) => e !== item) : [...d.equipment, item],
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await saveProfile({
      ...data,
      age: data.age ? Number(data.age) : null,
      height_cm: data.height_cm ? Number(data.height_cm) : null,
      current_weight_kg: data.current_weight_kg ? Number(data.current_weight_kg) : null,
      target_weight_kg: data.target_weight_kg ? Number(data.target_weight_kg) : null,
      daily_food_budget: data.daily_food_budget ? Number(data.daily_food_budget) : null,
      weekly_workout_target: data.weekly_workout_target ? Number(data.weekly_workout_target) : null,
    })
    setSaving(false)
    if (!error) setSaved(true)
  }

  return (
    <Container className="max-w-2xl py-8">
      <h2 className="text-2xl font-extrabold text-text">Your profile</h2>
      <p className="mt-1 text-sm text-text-secondary">
        This is what your calorie and protein targets are calculated from.
      </p>

      <form onSubmit={handleSave} className="mt-6 flex flex-col gap-6">
        <Card className="flex flex-col gap-4 p-5">
          <Input label="Full name" value={data.full_name} onChange={(e) => set('full_name', e.target.value)} />
          <div className="grid grid-cols-3 gap-3">
            <Input label="Age" type="number" value={data.age} onChange={(e) => set('age', e.target.value)} />
            <Input label="Height (cm)" type="number" value={data.height_cm} onChange={(e) => set('height_cm', e.target.value)} />
            <Input label="Weight (kg)" type="number" value={data.current_weight_kg} onChange={(e) => set('current_weight_kg', e.target.value)} />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-text">Biological sex</p>
            <div className="flex flex-wrap gap-2">
              {sexOptions.map((o) => (
                <Chip key={o.value} selected={data.biological_sex === o.value} onClick={() => set('biological_sex', o.value)}>
                  {o.label}
                </Chip>
              ))}
            </div>
          </div>
        </Card>

        <Card className="flex flex-col gap-4 p-5">
          <p className="text-sm font-semibold text-text">Goal &amp; experience</p>
          <div className="flex flex-wrap gap-2">
            {goalOptions.map((o) => (
              <Chip key={o.value} selected={data.fitness_goal === o.value} onClick={() => set('fitness_goal', o.value)}>
                {o.title}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {experienceOptions.map((o) => (
              <Chip key={o.value} selected={data.experience_level === o.value} onClick={() => set('experience_level', o.value)}>
                {o.title}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {activityOptions.map((o) => (
              <Chip key={o.value} selected={data.activity_level === o.value} onClick={() => set('activity_level', o.value)}>
                {o.title}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {locationOptions.map((o) => (
              <Chip key={o.value} selected={data.workout_location === o.value} onClick={() => set('workout_location', o.value)}>
                {o.title}
              </Chip>
            ))}
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-text">
              Equipment available <span className="font-normal text-text-secondary">(optional)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {equipmentOptions.map((item) => (
                <Chip key={item} selected={data.equipment.includes(item)} onClick={() => toggleEquipment(item)}>
                  {item}
                </Chip>
              ))}
            </div>
          </div>
          <Input
            label="Weekly workout target (sessions)"
            type="number"
            min="1"
            max="14"
            value={data.weekly_workout_target}
            onChange={(e) => set('weekly_workout_target', e.target.value)}
          />
        </Card>

        <Card className="flex flex-col gap-4 p-5">
          <p className="text-sm font-semibold text-text">Diet &amp; budget</p>
          <div className="flex flex-wrap gap-2">
            {dietOptions.map((o) => (
              <Chip key={o.value} selected={data.dietary_preference === o.value} onClick={() => set('dietary_preference', o.value)}>
                {o.title}
              </Chip>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Daily food budget (₹)" type="number" value={data.daily_food_budget} onChange={(e) => set('daily_food_budget', e.target.value)} />
            <Input label="Target weight (kg)" type="number" value={data.target_weight_kg} onChange={(e) => set('target_weight_kg', e.target.value)} />
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
          {saved && <p className="text-sm font-medium text-primary">Saved.</p>}
        </div>
      </form>
    </Container>
  )
}
