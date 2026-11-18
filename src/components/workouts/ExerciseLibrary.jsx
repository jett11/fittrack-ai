import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import Card from '../ui/Card'
import Input from '../ui/Input'
import Chip from '../ui/Chip'
import { searchExercises, getMuscleGroups } from '../../services/workoutService'
import { isDemoMode } from '../../services/supabaseClient'

export default function ExerciseLibrary({ onPick, pickedIds }) {
  const [query, setQuery] = useState('')
  const [muscleGroup, setMuscleGroup] = useState('')
  const [groups, setGroups] = useState([])
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemoMode) {
      setGroups([])
      setLoading(false)
      return
    }
    getMuscleGroups().then(setGroups)
  }, [])

  useEffect(() => {
    if (isDemoMode) {
      setExercises([])
      setLoading(false)
      return
    }
    setLoading(true)
    const timeout = setTimeout(() => {
      searchExercises({ query, muscleGroup }).then((data) => {
        setExercises(data)
        setLoading(false)
      })
    }, 250)
    return () => clearTimeout(timeout)
  }, [query, muscleGroup])

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
        <Input
          placeholder="Search exercises (e.g. squat, push-up)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {groups.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Chip selected={muscleGroup === ''} onClick={() => setMuscleGroup('')}>
            All muscles
          </Chip>
          {groups.map((g) => (
            <Chip key={g} selected={muscleGroup === g} onClick={() => setMuscleGroup(g)}>
              {g}
            </Chip>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-text-secondary">Loading exercises…</p>
      ) : exercises.length === 0 ? (
        <p className="text-sm text-text-secondary">No exercises found.</p>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {exercises.map((ex) => {
            const picked = pickedIds?.includes(ex.id)
            return (
              <Card
                key={ex.id}
                onClick={() => onPick?.(ex)}
                className={`cursor-pointer p-4 transition-colors ${picked ? 'border-primary bg-[var(--success-soft)]' : 'hover:bg-surface-2'}`}
              >
                <p className="text-sm font-semibold text-text">{ex.name}</p>
                <p className="mt-0.5 text-xs text-text-secondary">
                  {ex.muscle_group} &middot; {ex.difficulty} &middot; {ex.equipment}
                </p>
                {ex.instructions && <p className="mt-2 text-xs text-text-secondary">{ex.instructions}</p>}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
