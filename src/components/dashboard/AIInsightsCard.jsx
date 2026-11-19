import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import Card from '../ui/Card'
import { generateInsights } from '../../services/aiService'

export default function AIInsightsCard({ weightHistory, weeklyConsistency, todayMeals, todayWorkout, fitnessGoal }) {
  const [insight, setInsight] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    if (!weightHistory || weightHistory.length < 2) {
      setLoading(false)
      return undefined
    }

    setLoading(true)
    generateInsights({ weightHistory, weeklyConsistency, todayMeals, todayWorkout, fitnessGoal }).then(
      ({ data, error: genError }) => {
        if (cancelled) return
        if (genError) setError(true)
        else setInsight(data.insight)
        setLoading(false)
      }
    )

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weightHistory, fitnessGoal])

  return (
    <Card className="flex flex-col gap-2 p-5">
      <div className="flex items-center gap-2">
        <Sparkles size={17} className="text-primary" />
        <p className="text-sm font-semibold text-text">AI coach insight</p>
      </div>
      {loading ? (
        <p className="text-sm text-text-secondary">Thinking…</p>
      ) : error ? (
        <p className="text-sm text-text-secondary">Couldn&rsquo;t get an insight right now — try refreshing later.</p>
      ) : insight ? (
        <p className="text-sm text-text-secondary">{insight}</p>
      ) : (
        <p className="text-sm text-text-secondary">Keep logging — insights appear once there&rsquo;s more data.</p>
      )}
    </Card>
  )
}
