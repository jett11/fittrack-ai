import { Flame, Droplets, Scale, Dumbbell, Utensils, TrendingUp, Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { useDashboardData } from '../hooks/useDashboardData'
import { useDailyReminder } from '../hooks/useDailyReminder'
import { useChallenges } from '../hooks/useChallenges'
import { useWorkouts } from '../hooks/useWorkouts'
import { calculateStreak } from '../services/challengeService'
import { calculateCalorieTarget, calculateProteinTarget, calculateBMI, bmiCategory } from '../utils/nutritionCalculations'
import { goalOptions } from '../data/onboardingOptions'
import StatCard from '../components/dashboard/StatCard'
import WaterTracker from '../components/dashboard/WaterTracker'
import DailyCheckin from '../components/dashboard/DailyCheckin'
import TodayWorkoutCard from '../components/dashboard/TodayWorkoutCard'
import TodayNutritionCard from '../components/dashboard/TodayNutritionCard'
import CalorieRing from '../components/dashboard/CalorieRing'
import HeroChallengeCard from '../components/dashboard/HeroChallengeCard'
import WeeklyConsistencyChart from '../components/dashboard/WeeklyConsistencyChart'
import WeeklyCalorieChart from '../components/dashboard/WeeklyCalorieChart'
import WeightProgressChart from '../components/dashboard/WeightProgressChart'
import AIInsightsCard from '../components/dashboard/AIInsightsCard'
import RecentWorkoutsRow from '../components/dashboard/RecentWorkoutsRow'
import RecentActivityFeed from '../components/dashboard/RecentActivityFeed'

const firstName = (name) => (name ? name.split(' ')[0] : null)

function initials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase()
}

export default function Dashboard() {
  const { user, profile } = useAuth()
  const { water, checkin, meals, todayWorkout, weeklyConsistency, weeklyCalories, weightHistory, loading, updateWater, updateCheckin } =
    useDashboardData()
  const { challenges, completions, toggle: toggleChallenge } = useChallenges()
  const { templates, routines } = useWorkouts()
  const recentWorkouts = [...routines, ...templates].slice(0, 6)

  useDailyReminder({ water, todayWorkout, loading })

  const calorieTarget = profile ? calculateCalorieTarget(profile) : null
  const proteinTarget = profile ? calculateProteinTarget(profile) : null
  const bmi = profile ? calculateBMI(profile) : null
  const goalLabel = goalOptions.find((g) => g.value === profile?.fitness_goal)?.title
  const bestStreak = Math.max(0, ...challenges.map((c) => calculateStreak(completions, c.id)))

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <Container className="max-w-5xl py-6 sm:py-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-success-soft text-sm font-bold text-primary">
            {initials(profile?.full_name)}
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-base font-extrabold text-text">
              Hello{firstName(profile?.full_name) ? ` ${firstName(profile.full_name)}` : ''} <span aria-hidden>👋</span>
            </p>
            <p className="text-xs text-text-secondary">
              Get ready{goalLabel ? ` · ${goalLabel}` : ''} · {today}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {bestStreak > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-[rgb(249_115_22/16%)] px-2.5 py-1.5 text-xs font-bold text-[#f97316]">
              <Flame size={14} /> {bestStreak}
            </span>
          )}
          <Link
            to="/settings"
            aria-label="Notifications"
            className="relative grid h-10 w-10 place-items-center rounded-full bg-surface-2 text-text-secondary transition-colors hover:text-text"
          >
            <Bell size={17} />
            <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-danger" />
          </Link>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <Button as={Link} to="/workouts" size="sm" variant="secondary">
          <Dumbbell size={15} /> Log workout
        </Button>
        <Button as={Link} to="/nutrition" size="sm">
          <Utensils size={15} /> Log meal
        </Button>
      </div>

      {!loading && challenges.length > 0 && (
        <div className="mb-5">
          <HeroChallengeCard challenges={challenges} completions={completions} onToggle={toggleChallenge} />
        </div>
      )}

      {recentWorkouts.length > 0 && (
        <div className="mb-5">
          <RecentWorkoutsRow workouts={recentWorkouts} />
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
            <DailyCheckin checkin={checkin} onChange={updateCheckin} />
            <TodayWorkoutCard session={todayWorkout} />
            <TodayNutritionCard meals={meals} calorieTarget={calorieTarget} proteinTarget={proteinTarget} />
            <WeeklyConsistencyChart days={weeklyConsistency} />
            <WeeklyCalorieChart days={weeklyCalories} target={calorieTarget} />
            <RecentActivityFeed userId={user?.id} todayWorkout={todayWorkout} />
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
