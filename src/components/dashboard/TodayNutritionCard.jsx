import { Link } from 'react-router-dom'
import { Utensils } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'

function Bar({ label, value, target, unit }) {
  const pct = target ? Math.min(100, Math.round((value / target) * 100)) : 0
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-text-secondary">{label}</span>
        <span className="font-medium text-text">
          {Math.round(value)}
          {unit} {target ? `/ ${Math.round(target)}${unit}` : ''}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function TodayNutritionCard({ meals, calorieTarget, proteinTarget }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Utensils size={17} className="text-primary" />
          <p className="text-sm font-semibold text-text">Today&rsquo;s nutrition</p>
        </div>
        <Button as={Link} to="/nutrition" size="sm" variant="ghost">
          Log food
        </Button>
      </div>

      {meals.count === 0 ? (
        <p className="mt-3 text-sm text-text-secondary">Nothing logged yet today.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          <Bar label="Calories" value={meals.calories} target={calorieTarget} unit="" />
          <Bar label="Protein" value={meals.protein_g} target={proteinTarget} unit="g" />
        </div>
      )}
    </Card>
  )
}
