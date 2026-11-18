import { Link } from 'react-router-dom'
import { Dumbbell, CheckCircle2 } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'

export default function TodayWorkoutCard({ session }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <Dumbbell size={17} className="text-primary" />
        <p className="text-sm font-semibold text-text">Today&rsquo;s workout</p>
      </div>

      {!session && (
        <>
          <p className="mt-2 text-sm text-text-secondary">No workout started yet today.</p>
          <Button as={Link} to="/workouts" size="sm" className="mt-3">
            Start a workout
          </Button>
        </>
      )}

      {session && session.status === 'completed' && (
        <div className="mt-2 flex items-center gap-2 text-primary">
          <CheckCircle2 size={16} />
          <p className="text-sm font-semibold">{session.workouts?.name ?? 'Workout'} completed</p>
        </div>
      )}

      {session && session.status === 'in_progress' && (
        <>
          <p className="mt-2 text-sm text-text-secondary">
            {session.workouts?.name ?? 'Workout'} in progress &mdash; pick up where you left off.
          </p>
          <Button as={Link} to="/workouts" size="sm" variant="secondary" className="mt-3">
            Resume workout
          </Button>
        </>
      )}
    </Card>
  )
}
