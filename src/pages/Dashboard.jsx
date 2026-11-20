import { Flame, Droplets, Scale, Dumbbell, Utensils, TrendingUp, Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { useDashboardData } from '../hooks/useDashboardData'
import { useDailyReminder } from '../hooks/useDailyReminder'
import { useChallenges } from '../hooks/useChallenges'
import { calculateStreak } from '../services/challengeService'
import { calculateCalorieTarget, calculateProteinTarget, calculateBMI, bmiCategory } from '../utils/nutritionCalculations'
import { goalOptions } from '../data/onboardingOptions'
import StatCard from '../components/dashboard/StatCard'
import WaterTracker from '../components/dashboard/WaterTracker'
import TodayWorkoutCard from '../components/dashboard/TodayWorkoutCard'
import TodayNutritionCard from '../components/dashboard/TodayNutritionCard'
import CalorieRing from '../components/dashboard/CalorieRing'
import HeroChallengeCard from '../components/dashboard/HeroChallengeCard'
import WeeklyConsistencyChart from '../components/dashboard/WeeklyConsistencyChart'
import WeeklyCalorieChart from '../components/dashboard/WeeklyCalorieChart'
import WeightProgressChart from '../components/dashboard/WeightProgressChart'
import AIInsightsCard from '../components/dashboard/AIInsightsCard'

const firstName = (name) => (name ? name.split(' ')[0] : null)

function initials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase()
}

export default function Dashboard() {
  const { profile } = useAuth()
  const { water, meals, todayWorkout, weeklyConsistency, weeklyCalories, weightHistory, loading, updateWater } =
    useDashboardData()
  const { challenges, completions, toggle: toggleChallenge } = useChallenges()

  useDailyReminder({ water, todayWorkout, loading })

  const calorieTarget = profile ? calculateCalorieTarget(profile) : null
  const proteinTarget = profile ? calculateProteinTarget(profile) : null
  const bmi = profile ? calculateBMI(profile) : null
  const goalLabel = goalOptions.find((g) => g.value === profile?.fitness_goal)?.title
  const bestStreak = Math.max(0, ...challenges.map((c) => calculateStreak(completions, c.id)))

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <Container className="max-w-5xl py-6 sm:py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-success-soft text-sm font-bold text-primary">
            {initials(profile?.full_name)}
          </div>
          <div>
            <p className="text-sm text-text-secondary">
              {greeting}
              {firstName(profile?.full_name) ? `, ${firstName(profile.full_name)}` : ''} &middot; {today}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-extrabold text-text">Today&rsquo;s overview</h2>
              {goalLabel && (
                <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold text-text-secondary">
                  {goalLabel}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button as={Link} to="/settings" size="sm" variant="secondary" className="!px-2.5">
            <Bell size={16} />
          </Button>
          {bestStreak > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-[rgb(249_115_22/16%)] px-2.5 py-1.5 text-xs font-bold text-[#f97316]">
              <Flame size={14} /> {bestStreak}
            </span>
          )}
          <Button as={Link} to="/workouts" size="sm" variant="secondary">
            <Dumbbell size={15} /> Log workout
          </Button>
          <Button as={Link} to="/nutrition" size="sm">
            <Utensils size={15} /> Log meal
          </Button>
        </div>
      </div>

      {!loading && challenges.length > 0 && (
        <div className="mb-5">
          <HeroChallengeCard challenges={challenges} completions={completions} onToggle={toggleChallenge} />
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-[var(--radius-card)] bg-surface-2" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Flame}
              tone="calories"
              value={calorieTarget ? calorieTarget.toLocaleString('en-IN') : '—'}
              label="Daily calorie target"
              sub={calorieTarget ? 'Estimate, not medical advice' : 'Complete onboarding for this'}
            />
            <StatCard
              icon={Droplets}
              tone="water"
              value={`${water}/8`}
              label="Glasses of water today"
            />
            <StatCard
              icon={Scale}
              tone="scale"
              value={profile?.current_weight_kg ? `${profile.current_weight_kg}kg` : '—'}
              label="Current weight"
              sub={bmi ? `BMI ${bmi} · ${bmiCategory(bmi)}` : undefined}
            />
            <StatCard
              icon={TrendingUp}
              tone="primary"
              value={`${weeklyConsistency.filter((d) => d.completed).length}/7`}
              label="Active days this week"
            />
          </div>

          <div className="mt-5">
            <CalorieRing consumed={meals.calories} target={calorieTarget} />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <WaterTracker glasses={water} onChange={updateWater} />
            <TodayWorkoutCard session={todayWorkout} />
            <TodayNutritionCard meals={meals} calorieTarget={calorieTarget} proteinTarget={proteinTarget} />
            <WeeklyConsistencyChart days={weeklyConsistency} />
            <WeeklyCalorieChart days={weeklyCalories} target={calorieTarget} />
            <AIInsightsCard
              weightHistory={weightHistory}
              weeklyConsistency={weeklyConsistency}
              todayMeals={meals}
              todayWorkout={todayWorkout}
              fitnessGoal={profile?.fitness_goal}
            />
          </div>

          <div className="mt-4">
            <WeightProgressChart history={weightHistory} />
          </div>
        </>
      )}
    </Container>
  )
}
