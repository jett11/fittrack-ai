import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts'
import Card from '../ui/Card'

export default function WeeklyConsistencyChart({ days }) {
  const completedCount = days.filter((d) => d.completed).length
  const chartData = days.map((d) => ({ ...d, score: d.completed ? 100 : 18 }))

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-text">This week</p>
        <p className="text-sm font-bold text-primary">{completedCount}/7 days active</p>
      </div>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} barCategoryGap="22%">
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
            />
            <YAxis hide domain={[0, 100]} />
            <Tooltip
              cursor={{ fill: 'var(--surface-2)' }}
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                fontSize: 12,
              }}
              formatter={(_, __, item) => [item.payload.completed ? 'Workout completed' : 'No workout', '']}
            />
            <Bar dataKey="score" radius={[6, 6, 6, 6]} maxBarSize={28}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.completed ? 'var(--primary)' : 'var(--surface-2)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
