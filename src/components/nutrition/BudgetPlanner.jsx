import { useState } from 'react'
import { Wallet, Sparkles } from 'lucide-react'
import Card from '../ui/Card'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { suggestBudgetMeals, searchFoods, logMeal } from '../../services/nutritionService'
import { generateMealPlan } from '../../services/aiService'
import { calculateCalorieTarget, calculateProteinTarget } from '../../utils/nutritionCalculations'
import { useAuth } from '../../hooks/useAuth'

export default function BudgetPlanner() {
  const { user, profile } = useAuth()
  const [budget, setBudget] = useState(profile?.daily_food_budget ?? 150)
  const [result, setResult] = useState(null)
  const [rationale, setRationale] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [logging, setLogging] = useState(false)
  const [logged, setLogged] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    setError('')
    setRationale('')
    setLogged(false)
    setLoading(true)
    const res = await suggestBudgetMeals({ budget: Number(budget), dietaryPreference: profile?.dietary_preference })
    setResult(res)
    setLoading(false)
  }

  const handleGenerateAI = async () => {
    setError('')
    setRationale('')
    setLogged(false)
    setAiLoading(true)
    const calorieTarget = profile ? calculateCalorieTarget(profile) : null
    const proteinTarget = profile ? calculateProteinTarget(profile) : null
    const { data, error: genError } = await generateMealPlan({
      budget: Number(budget),
      dietaryPreference: profile?.dietary_preference,
      calorieTarget,
      proteinTarget,
    })
    if (genError) {
      setAiLoading(false)
      return setError(genError.message)
    }

    const foods = await searchFoods('')
    const byId = new Map(foods.map((f) => [f.id, f]))
    const items = data.items
      .map(({ food_id, quantity }) => {
        const food = byId.get(food_id)
        return food ? { food, quantity, cost: Math.round(quantity * (food.price_inr ?? 0)) } : null
      })
      .filter(Boolean)
    setAiLoading(false)

    if (!items.length) return setError('The AI couldn’t pick valid foods — try again.')

    setResult({
      items,
      totalCost: items.reduce((s, i) => s + i.cost, 0),
      totalCalories: items.reduce((s, i) => s + i.quantity * i.food.calories, 0),
      totalProtein: items.reduce((s, i) => s + i.quantity * i.food.protein_g, 0),
    })
    setRationale(data.rationale)
  }

  const handleLogPlan = async () => {
    if (!result?.items?.length || !user) return
    setLogging(true)
    for (const { food, quantity } of result.items) {
      // AI/budget plans aren't split by meal — bucket them all under "snack" rather
      // than guessing a meal type that may not match when the user actually eats.
      await logMeal(user.id, {
        foodId: food.id,
        mealType: 'snack',
        quantity,
        calories: quantity * food.calories,
        protein_g: quantity * food.protein_g,
        carbs_g: quantity * food.carbs_g,
        fat_g: quantity * food.fat_g,
      })
    }
    setLogging(false)
    setLogged(true)
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <Wallet size={17} className="text-primary" />
        <p className="text-sm font-semibold text-text">Budget meal plan</p>
      </div>
      <p className="mt-1 text-xs text-text-secondary">
        Estimated local market prices, picked to maximize protein for your {profile?.dietary_preference?.replace('_', '-') ?? ''} diet.
        Not real-time pricing.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-sm text-text-secondary">₹</span>
        <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="w-28" />
        <Button size="sm" variant="secondary" onClick={handleGenerate} disabled={loading || aiLoading}>
          {loading ? 'Thinking…' : 'Suggest meals'}
        </Button>
        <Button size="sm" onClick={handleGenerateAI} disabled={loading || aiLoading}>
          <Sparkles size={14} /> {aiLoading ? 'Thinking…' : 'Generate with AI'}
        </Button>
      </div>

      {error && <p className="mt-3 text-sm font-medium text-danger">{error}</p>}

      {result && (
        <div className="mt-4 flex flex-col gap-2">
          {result.items.length === 0 ? (
            <p className="text-sm text-text-secondary">Budget too low to suggest anything meaningful — try a higher amount.</p>
          ) : (
            <>
              {result.items.map(({ food, quantity, cost }) => (
                <div key={food.id} className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2">
                  <span className="text-sm text-text">
                    {food.name} <span className="text-text-secondary">&times;{quantity}</span>
                  </span>
                  <span className="text-xs font-medium text-text-secondary">₹{cost}</span>
                </div>
              ))}
              <div className="mt-2 flex items-center justify-between border-t border-border pt-3 text-sm">
                <span className="font-semibold text-text">
                  ₹{result.totalCost} &middot; {Math.round(result.totalCalories)} kcal &middot; {Math.round(result.totalProtein)}g protein
                </span>
              </div>
              {rationale && <p className="text-xs text-text-secondary">{rationale}</p>}
              <Button size="sm" variant="secondary" onClick={handleLogPlan} disabled={logging || logged} className="mt-1 self-start">
                {logged ? 'Logged ✓' : logging ? 'Logging…' : "Log this plan to today's meals"}
              </Button>
            </>
          )}
        </div>
      )}
    </Card>
  )
}
