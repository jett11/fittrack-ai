import { Award } from 'lucide-react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'

function computeMilestones(history) {
  const weighIns = history.filter((h) => h.weight_kg != null)
  const milestones = []

  if (weighIns.length >= 1) milestones.push('First measurement logged')
  if (weighIns.length >= 5) milestones.push('5 measurements logged')
  if (weighIns.length >= 10) milestones.push('10 measurements logged')

  if (weighIns.length >= 2) {
    const totalChange = Math.round((weighIns.at(-1).weight_kg - weighIns[0].weight_kg) * 10) / 10
    if (Math.abs(totalChange) >= 1) {
      milestones.push(`${totalChange > 0 ? '+' : ''}${totalChange}kg since your first log`)
    }
  }

  return milestones
}

export default function Milestones({ history }) {
  const milestones = computeMilestones(history)

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <Award size={17} className="text-primary" />
        <p className="text-sm font-semibold text-text">Milestones</p>
      </div>
      {milestones.length === 0 ? (
        <p className="text-sm text-text-secondary">Not enough data yet — keep logging to unlock milestones.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {milestones.map((m) => (
            <Badge key={m} tone="primary">
              {m}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  )
}
