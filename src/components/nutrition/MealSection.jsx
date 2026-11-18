import { Trash2 } from 'lucide-react'
import Card from '../ui/Card'

const LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snacks' }

export default function MealSection({ mealType, items, onDelete }) {
  if (items.length === 0) return null
  const calories = items.reduce((s, i) => s + Number(i.calories || 0), 0)

  return (
    <Card className="p-5">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-text">{LABELS[mealType] ?? mealType}</p>
        <p className="text-xs text-text-secondary">{Math.round(calories)} kcal</p>
      </div>
      <div className="flex flex-col gap-1.5">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-lg px-1 py-1.5">
            <div>
              <p className="text-sm text-text">
                {item.foods?.name ?? item.custom_food_name}{' '}
                {item.quantity !== 1 && <span className="text-text-secondary">&times;{item.quantity}</span>}
              </p>
              <p className="text-xs text-text-secondary">
                {Math.round(item.calories)} kcal &middot; {Math.round(item.protein_g)}g protein
              </p>
            </div>
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              aria-label="Remove"
              className="grid h-7 w-7 place-items-center rounded-full text-text-secondary hover:bg-surface-2 hover:text-danger"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </Card>
  )
}
