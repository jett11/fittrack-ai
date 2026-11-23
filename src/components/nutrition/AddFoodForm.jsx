import { useEffect, useState } from 'react'
import { Search, Plus, ScanLine } from 'lucide-react'
import Card from '../ui/Card'
import Input from '../ui/Input'
import Button from '../ui/Button'
import Chip from '../ui/Chip'
import BarcodeScanner from './BarcodeScanner'
import { searchFoods, logMeal } from '../../services/nutritionService'
import { useAuth } from '../../hooks/useAuth'

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
]

export default function AddFoodForm({ onAdded }) {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selected, setSelected] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [mealType, setMealType] = useState('breakfast')
  const [customName, setCustomName] = useState('')
  const [saving, setSaving] = useState(false)
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      if (query.trim()) searchFoods(query).then(setResults)
      else setResults([])
    }, 250)
    return () => clearTimeout(t)
  }, [query])

  const handleAdd = async () => {
    setSaving(true)
    const payload =
      selected.id || selected.scanned
        ? {
            foodId: selected.id ?? null,
            customFoodName: selected.id ? null : selected.name,
            mealType,
            quantity,
            calories: selected.calories * quantity,
            protein_g: selected.protein_g * quantity,
            carbs_g: selected.carbs_g * quantity,
            fat_g: selected.fat_g * quantity,
          }
        : {
            customFoodName: customName,
            mealType,
            quantity: 1,
            calories: 0,
            protein_g: 0,
            carbs_g: 0,
            fat_g: 0,
          }
    const { error } = await logMeal(user.id, payload)
    setSaving(false)
    if (!error) {
      setSelected(null)
      setQuery('')
      setCustomName('')
      setQuantity(1)
      onAdded?.()
    }
  }

  return (
    <Card className="p-5">
      <p className="mb-3 text-sm font-semibold text-text">Add food</p>

      {!selected ? (
        <>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
              <Input
                placeholder="Search e.g. roti, dal, paneer…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={() => setScanning(true)} className="!px-3">
              <ScanLine size={16} />
            </Button>
          </div>
          {results.length > 0 && (
            <div className="mt-2 flex flex-col gap-1.5">
              {results.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelected(f)}
                  className="flex items-center justify-between rounded-xl border border-border px-3.5 py-2.5 text-left hover:bg-surface-2"
                >
                  <span>
                    <span className="block text-sm font-medium text-text">{f.name}</span>
                    <span className="block text-xs text-text-secondary">
                      {f.serving_size} &middot; {f.calories} kcal &middot; {f.protein_g}g protein
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
          {query.trim() && results.length === 0 && (
            <div className="mt-2 flex items-center gap-2">
              <Input placeholder="Or log a custom item by name" value={customName} onChange={(e) => setCustomName(e.target.value || query)} />
              <Button size="sm" variant="secondary" onClick={() => setSelected({ custom: true, name: query })}>
                Use custom
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-sm font-medium text-text">{selected.custom ? (customName || selected.name) : selected.name}</p>
            {selected.scanned && (
              <p className="text-xs text-text-secondary">
                Scanned &middot; {selected.calories} kcal per {selected.serving_size}
              </p>
            )}
          </div>
          {!selected.custom && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-secondary">{selected.scanned ? `x ${selected.serving_size}:` : 'Servings:'}</span>
              <Input
                type="number"
                min="0.5"
                step="0.5"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                className="w-20"
              />
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {MEAL_TYPES.map((m) => (
              <Chip key={m.value} selected={mealType === m.value} onClick={() => setMealType(m.value)}>
                {m.label}
              </Chip>
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={saving}>
              <Plus size={14} /> {saving ? 'Adding…' : 'Add to log'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {scanning && (
        <BarcodeScanner
          onClose={() => setScanning(false)}
          onFound={(product) => {
            setScanning(false)
            setSelected({ scanned: true, ...product })
          }}
        />
      )}
    </Card>
  )
}
