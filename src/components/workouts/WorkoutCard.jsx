import { Link } from 'react-router-dom'
import { Dumbbell, Home, Building2 } from 'lucide-react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'

const locationIcon = { home: Home, gym: Building2, both: Dumbbell }

const labelMap = {
  muscle_gain: 'Muscle gain',
  fat_loss: 'Fat loss',
  general_fitness: 'General fitness',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

export default function WorkoutCard({ workout }) {
  const LocIcon = locationIcon[workout.location] ?? Dumbbell
  return (
    <Link to={`/workouts/${workout.id}`}>
      <Card className="flex h-full flex-col gap-3 p-5 transition-transform hover:-translate-y-0.5">
        <div className="flex items-center justify-between">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--success-soft)] text-primary">
            <LocIcon size={18} />
          </span>
          {workout.is_template ? <Badge tone="neutral">Template</Badge> : <Badge tone="primary">My routine</Badge>}
        </div>
        <p className="font-bold text-text">{workout.name}</p>
        <div className="mt-auto flex flex-wrap gap-1.5 text-xs text-text-secondary">
          {workout.goal && <span>{labelMap[workout.goal] ?? workout.goal}</span>}
          {workout.level && <span>&middot; {labelMap[workout.level] ?? workout.level}</span>}
        </div>
      </Card>
    </Link>
  )
}
