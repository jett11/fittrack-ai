import { Utensils, Dumbbell, TrendingUp } from 'lucide-react'
import Card from '../ui/Card'
import { useInsights } from '../../hooks/useInsights'

const SECTIONS = [
  { key: 'nutrition', icon: Utensils, title: 'Nutrition', empty: 'Log a few meals this week to see nutrition insights.' },
  { key: 'workout', icon: Dumbbell, title: 'Workout', empty: 'Complete a few workouts to see training insights.' },
  { key: 'progress', icon: TrendingUp, title: 'Progress', empty: 'Log at least two measurements to see progress insights.' },
]

export default function InsightsPanel() {
  const { insights, loading } = useInsights()

  if (loading) return <p className="text-sm text-text-secondary">Loading…</p>

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-text-secondary">
        These are calculated directly from your own logged data — not a medical diagnosis, and not a guarantee of future
        results.
      </p>
      {SECTIONS.map(({ key, icon: Icon, title, empty }) => (
        <Card key={key} className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <Icon size={17} className="text-primary" />
            <p className="text-sm font-semibold text-text">{title}</p>
          </div>
          {insights[key].length === 0 ? (
            <p className="text-sm text-text-secondary">Not enough data yet — {empty.charAt(0).toLowerCase() + empty.slice(1)}</p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {insights[key].map((i) => (
                <div key={i.id} className="py-2.5 first:pt-0 last:pb-0">
                  <p className="text-sm text-text">{i.text}</p>
                  <p className="mt-0.5 text-xs text-text-secondary">{i.caption}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}
