import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip, ReferenceLine } from 'recharts'
import Card from '../ui/Card'

export default function WeeklyCalorieChart({ days, target }) {
  const hasData = days.some((d) => d.calories > 0)
  const avg = hasData ? Math.round(days.reduce((s, d) => s + d.calories, 0) / days.length) : null

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-text">Weekly calorie intake</p>
        {avg != null && <p className="text-sm font-bold text-primary">{avg.toLocaleString('en-IN')} avg/day</p>}
      </div>

      {hasData ? (
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={days} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} barCategoryGap="22%">
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: 'var(--surface-2)' }}
                contentStyle={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  fontSize: 12,
                }}
                formatter={(value) => [`${value} kcal`, 'Logged']}
              />
              {target && (
                <ReferenceLine y={target} stroke="var(--accent)" strokeDasharray="4 4" strokeWidth={1.5} />
              )}
              <Bar dataKey="calories" radius={[6, 6, 6, 6]} maxBarSize={28}>
                {days.map((d, i) => (
                  <Cell key={i} fill={d.calories > 0 ? 'var(--primary)' : 'var(--surface-2)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="py-6 text-center text-sm text-text-secondary">Log meals this week to see your trend here.</p>
      )}
    </Card>
  )
}
