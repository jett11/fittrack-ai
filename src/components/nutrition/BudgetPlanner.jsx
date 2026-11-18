import { useState } from 'react'
import { Wallet } from 'lucide-react'
import Card from '../ui/Card'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { suggestBudgetMeals } from '../../services/nutritionService'
import { useAuth } from '../../hooks/useAuth'

export default function BudgetPlanner() {
  const { profile } = useAuth()
  const [budget, setBudget] = useState(profile?.daily_food_budget ?? 150)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    const res = await suggestBudgetMeals({ budget: Number(budget), dietaryPreference: profile?.dietary_preference })
    setResult(res)
    setLoading(false)
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

      <div className="mt-3 flex items-center gap-2">
        <span className="text-sm text-text-secondary">₹</span>
        <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="w-28" />
        <Button size="sm" onClick={handleGenerate} disabled={loading}>
          {loading ? 'Thinking…' : 'Generate plan'}
        </Button>
      </div>

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
            </>
          )}
        </div>
      )}
    </Card>
  )
}
