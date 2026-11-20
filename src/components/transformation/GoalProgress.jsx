import { Target } from 'lucide-react'
import Card from '../ui/Card'

export default function GoalProgress({ startingWeight, currentWeight, targetWeight }) {
  if (!targetWeight || !startingWeight || currentWeight == null) {
    return (
      <Card className="p-5">
        <div className="mb-1 flex items-center gap-2">
          <Target size={17} className="text-primary" />
          <p className="text-sm font-semibold text-text">Goal progress</p>
        </div>
        <p className="text-sm text-text-secondary">
          Set a target weight in your profile and log a measurement to see this.
        </p>
      </Card>
    )
  }

  const span = targetWeight - startingWeight
  const traveled = span === 0 ? 1 : (currentWeight - startingWeight) / span
  const pct = Math.max(0, Math.min(100, Math.round(traveled * 100)))
  const remaining = Math.round(Math.abs(targetWeight - currentWeight) * 10) / 10
  const reached = pct >= 100

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target size={17} className="text-primary" />
          <p className="text-sm font-semibold text-text">Goal progress</p>
        </div>
        <p className="text-sm font-bold text-text">{pct}%</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-text-secondary">
        {reached
          ? `You've reached your target of ${targetWeight}kg.`
          : `${remaining}kg to go to reach your ${targetWeight}kg goal.`}
      </p>
    </Card>
  )
}
