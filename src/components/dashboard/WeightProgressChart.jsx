import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { TrendingUp } from 'lucide-react'
import Card from '../ui/Card'

export default function WeightProgressChart({ history }) {
  if (!history || history.length < 2) {
    return (
      <Card className="flex flex-col items-center justify-center gap-2 p-5 text-center">
        <TrendingUp size={22} className="text-text-secondary" />
        <p className="text-sm font-semibold text-text">Weight progress</p>
        <p className="max-w-[22ch] text-xs text-text-secondary">
          Log your weight at least twice from Transformation to see a trend here.
        </p>
      </Card>
    )
  }

  const chartData = history.map((h) => ({
    date: new Date(h.measured_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    weight: h.weight_kg,
  }))
  const change = (chartData.at(-1).weight - chartData[0].weight).toFixed(1)

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-text">Weight progress</p>
        <p className={`text-sm font-bold ${change <= 0 ? 'text-primary' : 'text-text'}`}>
          {change > 0 ? '+' : ''}
          {change}kg
        </p>
      </div>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
            <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
            <Tooltip
              contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }}
              formatter={(v) => [`${v} kg`, 'Weight']}
            />
            <Area type="monotone" dataKey="weight" stroke="var(--primary)" strokeWidth={2} fill="url(#weightFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
