import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, CheckCircle2, XCircle, Clock, MapPin } from 'lucide-react'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import Tabs from '../components/ui/Tabs'
import Card from '../components/ui/Card'
import PremiumGate from '../components/ui/PremiumGate'
import WorkoutCard from '../components/workouts/WorkoutCard'
import ExerciseLibrary from '../components/workouts/ExerciseLibrary'
import WorkoutAnalytics from '../components/workouts/WorkoutAnalytics'
import { useWorkouts } from '../hooks/useWorkouts'
import { useAuth } from '../hooks/useAuth'
import { isDemoMode } from '../services/supabaseClient'

const TABS = [
  { value: 'templates', label: 'Templates' },
  { value: 'routines', label: 'My Routines' },
  { value: 'library', label: 'Exercise Library' },
  { value: 'history', label: 'History' },
  { value: 'analytics', label: 'Analytics' },
]

const GOAL_FILTERS = [
  { value: '', label: 'All goals' },
  { value: 'muscle_gain', label: 'Muscle gain' },
  { value: 'fat_loss', label: 'Fat loss' },
  { value: 'general_fitness', label: 'General fitness' },
]

const LOCATION_FILTERS = [
  { value: '', label: 'Any location' },
  { value: 'home', label: 'Home' },
  { value: 'gym', label: 'Gym' },
]

const LEVEL_FILTERS = [
  { value: '', label: 'Any level' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
        active ? 'bg-primary text-primary-foreground' : 'bg-surface-2 text-text-secondary hover:text-text'
      }`}
    >
      {children}
    </button>
  )
}

const CARDIO_LABELS = { run: 'Run', walk: 'Walk', cycle: 'Ride' }

function historyLabel(s) {
  if (s.session_type === 'cardio') {
    const label = CARDIO_LABELS[s.cardio_type] ?? 'Cardio'
    return s.distance_km ? `${label} — ${s.distance_km}km` : label
  }
  return s.workouts?.name ?? 'Workout'
}

function historyIcon(status) {
  if (status === 'completed') return <CheckCircle2 size={16} className="text-primary" />
  if (status === 'abandoned') return <XCircle size={16} className="text-text-secondary" />
  return <Clock size={16} className="text-accent" />
}

export default function Workouts() {
  const [tab, setTab] = useState('templates')
  const [goalFilter, setGoalFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const { templates, routines, history, loading } = useWorkouts()
  const { profile, user } = useAuth()
  const isPremium = !!profile?.is_premium

  const filteredTemplates = templates.filter(
    (w) =>
      (!goalFilter || w.goal === goalFilter) &&
      (!locationFilter || w.location === locationFilter || w.location === 'both') &&
      (!levelFilter || w.level === levelFilter)
  )

  return (
    <Container className="max-w-5xl py-6 sm:py-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-extrabold text-text">Workouts</h2>
        <div className="flex gap-2">
          <Button as={Link} to="/workouts/cardio" size="sm" variant="secondary">
            <MapPin size={15} /> Track cardio
          </Button>
          {isPremium && (
            <Button as={Link} to="/workouts/new" size="sm">
              <Plus size={15} /> New routine
            </Button>
          )}
        </div>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      <div className="mt-5">
        {isDemoMode && tab !== 'library' && (
          <p className="mb-4 text-sm text-text-secondary">
            Demo mode doesn&rsquo;t simulate the workout catalog — connect a real account to see this.
          </p>
        )}

        {tab === 'templates' &&
          (loading ? (
            <p className="text-sm text-text-secondary">Loading…</p>
          ) : templates.length === 0 ? (
            <p className="text-sm text-text-secondary">No templates available yet.</p>
          ) : (
            <>
              <div className="mb-4 flex flex-col gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {GOAL_FILTERS.map((f) => (
                    <FilterChip key={f.value} active={goalFilter === f.value} onClick={() => setGoalFilter(f.value)}>
                      {f.label}
                    </FilterChip>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {LOCATION_FILTERS.map((f) => (
                    <FilterChip
                      key={f.value}
                      active={locationFilter === f.value}
                      onClick={() => setLocationFilter(f.value)}
                    >
                      {f.label}
                    </FilterChip>
                  ))}
                  {LEVEL_FILTERS.map((f) => (
                    <FilterChip key={f.value} active={levelFilter === f.value} onClick={() => setLevelFilter(f.value)}>
                      {f.label}
                    </FilterChip>
                  ))}
                </div>
              </div>
              {filteredTemplates.length === 0 ? (
                <p className="text-sm text-text-secondary">No templates match these filters.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredTemplates.map((w, i) => (
                    <WorkoutCard key={w.id} workout={w} index={i} />
                  ))}
                </div>
              )}
            </>
          ))}

        {tab === 'routines' &&
          (!isPremium ? (
            <PremiumGate
              title="Build your own routines"
              description="Custom routine building is a Premium feature — pick your own exercises, sets and reps."
            />
          ) : loading ? (
            <p className="text-sm text-text-secondary">Loading…</p>
          ) : routines.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-sm text-text-secondary">You haven&rsquo;t built a custom routine yet.</p>
              <Button as={Link} to="/workouts/new" size="sm" className="mt-3">
                <Plus size={15} /> Build one
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {routines.map((w, i) => (
                <WorkoutCard key={w.id} workout={w} index={i} />
              ))}
            </div>
          ))}

        {tab === 'library' && <ExerciseLibrary />}

        {tab === 'history' &&
          (!isPremium ? (
            <PremiumGate
              title="See your full workout history"
              description="Track every past session, completed or not — a Premium feature."
            />
          ) : loading ? (
            <p className="text-sm text-text-secondary">Loading…</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-text-secondary">No workout sessions logged yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {history.map((s) => (
                <Card key={s.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {historyIcon(s.status)}
                    <div>
                      <p className="text-sm font-semibold text-text">{historyLabel(s)}</p>
                      <p className="text-xs text-text-secondary">
                        {new Date(s.started_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium capitalize text-text-secondary">{s.status.replace('_', ' ')}</span>
                </Card>
              ))}
            </div>
          ))}

        {tab === 'analytics' &&
          (!isPremium ? (
            <PremiumGate
              title="See your workout analytics"
              description="Training volume, muscle group distribution and personal records — a Premium feature."
            />
          ) : (
            <WorkoutAnalytics userId={user.id} weeklyTarget={profile?.weekly_workout_target} />
          ))}
      </div>
    </Container>
  )
}
