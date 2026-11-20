import Card from '../ui/Card'

const LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snacks' }

export default function MealDistribution({ meals }) {
  const totalsByType = Object.keys(LABELS).map((type) => ({
    type,
    calories: meals.filter((m) => m.meal_type === type).reduce((s, m) => s + Number(m.calories || 0), 0),
  }))
  const dayTotal = totalsByType.reduce((s, t) => s + t.calories, 0)

  return (
    <Card className="p-5">
      <p className="mb-3 text-sm font-semibold text-text">Today&rsquo;s meal breakdown</p>
      {dayTotal === 0 ? (
        <p className="py-2 text-sm text-text-secondary">Nothing logged yet today.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {totalsByType.map((t) => {
            const pct = Math.round((t.calories / dayTotal) * 100)
            return (
              <div key={t.type}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-text-secondary">{LABELS[t.type]}</span>
                  <span className="font-medium text-text">
                    {Math.round(t.calories)} kcal {t.calories > 0 ? `(${pct}%)` : ''}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
