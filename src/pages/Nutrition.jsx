import { useCallback, useEffect, useState } from 'react'
import Container from '../components/ui/Container'
import Card from '../components/ui/Card'
import Tabs from '../components/ui/Tabs'
import AddFoodForm from '../components/nutrition/AddFoodForm'
import MealSection from '../components/nutrition/MealSection'
import BudgetPlanner from '../components/nutrition/BudgetPlanner'
import PremiumGate from '../components/ui/PremiumGate'
import { useAuth } from '../hooks/useAuth'
import { getTodayMeals, deleteMealLog } from '../services/nutritionService'
import { calculateCalorieTarget, calculateProteinTarget } from '../utils/nutritionCalculations'
import { isDemoMode } from '../services/supabaseClient'

const TABS = [
  { value: 'log', label: "Today's Log" },
  { value: 'budget', label: 'Budget Planner' },
]

function SummaryBar({ label, value, target, unit }) {
  const pct = target ? Math.min(100, Math.round((value / target) * 100)) : 0
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-text-secondary">{label}</span>
        <span className="font-medium text-text">
          {Math.round(value)}
          {unit} {target ? `/ ${Math.round(target)}${unit}` : ''}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function Nutrition() {
  const { user, profile } = useAuth()
  const [tab, setTab] = useState('log')
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    if (isDemoMode || !user) {
      setMeals([])
      setLoading(false)
      return
    }
    setLoading(true)
    getTodayMeals(user.id).then((data) => {
      setMeals(data)
      setLoading(false)
    })
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async (id) => {
    setMeals((m) => m.filter((x) => x.id !== id))
    await deleteMealLog(id)
  }

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + Number(m.calories || 0),
      protein_g: acc.protein_g + Number(m.protein_g || 0),
      carbs_g: acc.carbs_g + Number(m.carbs_g || 0),
      fat_g: acc.fat_g + Number(m.fat_g || 0),
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  )

  const calorieTarget = profile ? calculateCalorieTarget(profile) : null
  const proteinTarget = profile ? calculateProteinTarget(profile) : null

  const byType = (type) => meals.filter((m) => m.meal_type === type)

  return (
    <Container className="max-w-2xl py-6 sm:py-8">
      <h2 className="mb-5 text-2xl font-extrabold text-text">Nutrition</h2>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'log' ? (
        <div className="mt-5 flex flex-col gap-4">
          {isDemoMode && (
            <p className="text-sm text-text-secondary">Demo mode doesn&rsquo;t simulate the food log — connect a real account to try this.</p>
          )}

          <Card className="flex flex-col gap-3 p-5">
            <SummaryBar label="Calories" value={totals.calories} target={calorieTarget} unit="" />
            <SummaryBar label="Protein" value={totals.protein_g} target={proteinTarget} unit="g" />
            <SummaryBar label="Carbs" value={totals.carbs_g} unit="g" />
            <SummaryBar label="Fat" value={totals.fat_g} unit="g" />
          </Card>

          <AddFoodForm onAdded={load} />

          {loading ? (
            <p className="text-sm text-text-secondary">Loading…</p>
          ) : (
            ['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
              <MealSection key={type} mealType={type} items={byType(type)} onDelete={handleDelete} />
            ))
          )}
        </div>
      ) : (
        <div className="mt-5">
          {profile?.is_premium ? (
            <BudgetPlanner />
          ) : (
            <PremiumGate
              title="Plan meals around your budget"
              description="The budget-based meal planner is a Premium feature — tell us your daily budget and get real food suggestions."
            />
          )}
        </div>
      )}
    </Container>
  )
}
