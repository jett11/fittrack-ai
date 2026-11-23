import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Play } from 'lucide-react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Poster from '../ui/Poster'
import { getWorkoutPosterUrl } from '../../data/workoutPosters'

const labelMap = {
  muscle_gain: 'Muscle gain',
  fat_loss: 'Fat loss',
  general_fitness: 'General fitness',
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

export default function WorkoutCard({ workout, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.04 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link to={`/workouts/${workout.id}`}>
        <Card className="flex h-full flex-col overflow-hidden p-0">
          <Poster src={getWorkoutPosterUrl(workout)} alt="">
            <div className="flex h-full flex-col justify-between p-3.5">
              <div className="flex items-start justify-between">
                {workout.is_template ? <Badge tone="neutral">Template</Badge> : <Badge tone="primary">My routine</Badge>}
                <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-card)]">
                  <Play size={15} fill="currentColor" />
                </span>
              </div>
              <div>
                <p className="font-bold text-white drop-shadow-sm">{workout.name}</p>
                <div className="mt-1 flex flex-wrap gap-1.5 text-xs text-white/80">
                  {workout.goal && <span>{labelMap[workout.goal] ?? workout.goal}</span>}
                  {workout.level && <span>&middot; {labelMap[workout.level] ?? workout.level}</span>}
                </div>
              </div>
            </div>
          </Poster>
        </Card>
      </Link>
    </motion.div>
  )
}
