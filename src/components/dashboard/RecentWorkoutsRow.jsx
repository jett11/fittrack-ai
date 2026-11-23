import { Link } from 'react-router-dom'
import WorkoutCard from '../workouts/WorkoutCard'

export default function RecentWorkoutsRow({ workouts }) {
  if (!workouts.length) return null

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-text">Recent workouts</p>
        <Link to="/workouts" className="text-xs font-semibold text-primary">
          See all
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {workouts.map((w, i) => (
          <div key={w.id} className="w-40 shrink-0 sm:w-44">
            <WorkoutCard workout={w} index={i} />
          </div>
        ))}
      </div>
    </div>
  )
}
