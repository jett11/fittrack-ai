import { Flame, Droplets, Scale, Dumbbell, Utensils, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { useDashboardData } from '../hooks/useDashboardData'
import { calculateCalorieTarget, calculateProteinTarget, calculateBMI, bmiCategory } from '../utils/nutritionCalculations'
import StatCard from '../components/dashboard/StatCard'
import WaterTracker from '../components/dashboard/WaterTracker'
import TodayWorkoutCard from '../components/dashboard/TodayWorkoutCard'
import TodayNutritionCard from '../components/dashboard/TodayNutritionCard'
import WeeklyConsistencyChart from '../components/dashboard/WeeklyConsistencyChart'
import WeightProgressChart from '../components/dashboard/WeightProgressChart'
import AIInsightsCard from '../components/dashboard/AIInsightsCard'

const firstName = (name) => (name ? name.split(' ')[0] : null)

export default function Dashboard() {
  const { profile } = useAuth()
  const { water, meals, todayWorkout, weeklyConsistency, weightHistory, loading, updateWater } = useDashboardData()

  const calorieTarget = profile ? calculateCalorieTarget(profile) : null
  const proteinTarget = profile ? calculateProteinTarget(profile) : null
  const bmi = profile ? calculateBMI(profile) : null

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <Container className="max-w-5xl py-6 sm:py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-text-secondary">
            {greeting}
            {firstName(profile?.full_name) ? `, ${firstName(profile.full_name)}` : ''}
          </p>
          <h2 className="text-2xl font-extrabold text-text">Today&rsquo;s overview</h2>
        </div>
        <div className="flex gap-2">
          <Button as={Link} to="/workouts" size="sm" variant="secondary">
            <Dumbbell size={15} /> Log workout
          </Button>
          <Button as={Link} to="/nutrition" size="sm">
            <Utensils size={15} /> Log meal
          </Button>
        </div>
      </div>

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
              value={calorieTarget ? calorieTarget.toLocaleString('en-IN') : '—'}
              label="Daily calorie target"
              sub={calorieTarget ? 'Estimate, not medical advice' : 'Complete onboarding for this'}
            />
            <StatCard
              icon={Droplets}
              value={`${water}/8`}
              label="Glasses of water today"
            />
            <StatCard
              icon={Scale}
              value={profile?.current_weight_kg ? `${profile.current_weight_kg}kg` : '—'}
              label="Current weight"
              sub={bmi ? `BMI ${bmi} · ${bmiCategory(bmi)}` : undefined}
            />
            <StatCard
              icon={TrendingUp}
              value={`${weeklyConsistency.filter((d) => d.completed).length}/7`}
              label="Active days this week"
            />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <WaterTracker glasses={water} onChange={updateWater} />
            <TodayWorkoutCard session={todayWorkout} />
            <TodayNutritionCard meals={meals} calorieTarget={calorieTarget} proteinTarget={proteinTarget} />
            <WeeklyConsistencyChart days={weeklyConsistency} />
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
