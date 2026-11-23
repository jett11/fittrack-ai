import { useEffect, useState } from 'react'
import { Utensils, Dumbbell } from 'lucide-react'
import Card from '../ui/Card'
import { getTodayMeals } from '../../services/nutritionService'

const ICONS = {
  workout: { Icon: Dumbbell, bg: 'rgb(56 189 248 / 16%)', fg: '#38bdf8' },
  meal: { Icon: Utensils, bg: 'rgb(249 115 22 / 16%)', fg: '#f97316' },
}

function timeLabel(iso) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
}

export default function RecentActivityFeed({ userId, todayWorkout }) {
  const [meals, setMeals] = useState([])

  useEffect(() => {
    if (!userId) return
    getTodayMeals(userId).then(setMeals)
  }, [userId])

  const items = []
  if (todayWorkout) {
    items.push({
      key: 'workout',
      kind: 'workout',
      label: todayWorkout.workouts?.name ?? 'Workout',
      sub: todayWorkout.status === 'completed' ? 'Completed' : 'In progress',
      time: todayWorkout.started_at,
    })
  }
  meals.forEach((m) => {
    items.push({
      key: m.id,
      kind: 'meal',
      label: m.foods?.name ?? m.custom_food_name ?? 'Meal',
      sub: m.meal_type,
      time: m.created_at,
    })
  })
  items.sort((a, b) => new Date(b.time) - new Date(a.time))
  const top = items.slice(0, 4)

  if (!top.length) return null

  return (
    <Card className="p-5">
      <p className="mb-3 text-sm font-semibold text-text">Recent activity</p>
      <div className="flex flex-col gap-3">
        {top.map((item) => {
          const { Icon, bg, fg } = ICONS[item.kind]
          return (
            <div key={item.key} className="flex items-center gap-3">
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
                style={{ backgroundColor: bg, color: fg }}
              >
                <Icon size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text">{item.label}</p>
                <p className="text-xs capitalize text-text-secondary">{item.sub}</p>
              </div>
              <span className="shrink-0 text-xs text-text-secondary">{timeLabel(item.time)}</span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
