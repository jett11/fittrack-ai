import { useState } from 'react'
import { Scale } from 'lucide-react'
import Card from '../ui/Card'
import Input from '../ui/Input'
import Button from '../ui/Button'

export default function MeasurementForm({ onSave }) {
  const [form, setForm] = useState({ weight_kg: '', waist_cm: '', chest_cm: '', arm_cm: '', thigh_cm: '' })
  const [saving, setSaving] = useState(false)

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleSave = async () => {
    const hasAny = Object.values(form).some((v) => v !== '')
    if (!hasAny) return
    setSaving(true)
    await onSave({
      weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
      waist_cm: form.waist_cm ? Number(form.waist_cm) : null,
      chest_cm: form.chest_cm ? Number(form.chest_cm) : null,
      arm_cm: form.arm_cm ? Number(form.arm_cm) : null,
      thigh_cm: form.thigh_cm ? Number(form.thigh_cm) : null,
    })
    setSaving(false)
    setForm({ weight_kg: '', waist_cm: '', chest_cm: '', arm_cm: '', thigh_cm: '' })
  }

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <Scale size={17} className="text-primary" />
        <p className="text-sm font-semibold text-text">Log today&rsquo;s measurements</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Input label="Weight (kg)" type="number" value={form.weight_kg} onChange={(e) => set('weight_kg', e.target.value)} />
        <Input label="Waist (cm)" type="number" value={form.waist_cm} onChange={(e) => set('waist_cm', e.target.value)} />
        <Input label="Chest (cm)" type="number" value={form.chest_cm} onChange={(e) => set('chest_cm', e.target.value)} />
        <Input label="Arm (cm)" type="number" value={form.arm_cm} onChange={(e) => set('arm_cm', e.target.value)} />
        <Input label="Thigh (cm)" type="number" value={form.thigh_cm} onChange={(e) => set('thigh_cm', e.target.value)} />
      </div>
      <Button onClick={handleSave} disabled={saving} size="sm" className="mt-4">
        {saving ? 'Saving…' : 'Save'}
      </Button>
    </Card>
  )
}
