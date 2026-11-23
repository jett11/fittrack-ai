import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { getExerciseProgressHistory } from '../../services/workoutService'

export default function ExerciseProgressChart({ exerciseId }) {
  const [history, setHistory] = useState(null)

  useEffect(() => {
    let active = true
    getExerciseProgressHistory(exerciseId).then((data) => {
      if (active) setHistory(data)
    })
    return () => {
      active = false
    }
  }, [exerciseId])

  if (history === null) {
    return <p className="py-2 text-xs text-text-secondary">Loading your progress…</p>
  }

  if (history.length < 2) {
    return (
      <p className="py-2 text-xs text-text-secondary">
        Log weight on this exercise a couple more times to see your progress here.
      </p>
    )
  }

  const chartData = history.map((h) => ({
    date: new Date(h.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    weight: Number(h.weight_kg),
  }))
  const latest = chartData.at(-1).weight

  return (
    <div className="pt-1">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-secondary">My progress</p>
      <p className="text-3xl font-extrabold text-primary">{latest}kg</p>
      <div className="mt-2 h-28">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
            <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
            <Tooltip
              contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }}
              formatter={(v) => [`${v} kg`, 'Weight']}
            />
            <Line type="monotone" dataKey="weight" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3, fill: 'var(--primary)' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
