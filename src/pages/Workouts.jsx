import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, CheckCircle2, XCircle, Clock } from 'lucide-react'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import Tabs from '../components/ui/Tabs'
import Card from '../components/ui/Card'
import PremiumGate from '../components/ui/PremiumGate'
import WorkoutCard from '../components/workouts/WorkoutCard'
import ExerciseLibrary from '../components/workouts/ExerciseLibrary'
import { useWorkouts } from '../hooks/useWorkouts'
import { useAuth } from '../hooks/useAuth'
import { isDemoMode } from '../services/supabaseClient'

const TABS = [
  { value: 'templates', label: 'Templates' },
  { value: 'routines', label: 'My Routines' },
  { value: 'library', label: 'Exercise Library' },
  { value: 'history', label: 'History' },
]

function historyIcon(status) {
  if (status === 'completed') return <CheckCircle2 size={16} className="text-primary" />
  if (status === 'abandoned') return <XCircle size={16} className="text-text-secondary" />
  return <Clock size={16} className="text-accent" />
}

export default function Workouts() {
  const [tab, setTab] = useState('templates')
  const { templates, routines, history, loading } = useWorkouts()
  const { profile } = useAuth()
  const isPremium = !!profile?.is_premium

  return (
    <Container className="max-w-5xl py-6 sm:py-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-extrabold text-text">Workouts</h2>
        {isPremium && (
          <Button as={Link} to="/workouts/new" size="sm">
            <Plus size={15} /> New routine
          </Button>
        )}
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((w) => (
                <WorkoutCard key={w.id} workout={w} />
              ))}
            </div>
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
              {routines.map((w) => (
                <WorkoutCard key={w.id} workout={w} />
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
                      <p className="text-sm font-semibold text-text">{s.workouts?.name ?? 'Workout'}</p>
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
      </div>
    </Container>
  )
}
