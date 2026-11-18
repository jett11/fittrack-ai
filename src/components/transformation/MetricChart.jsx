import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import Card from '../ui/Card'

export default function MetricChart({ label, unit, history, field }) {
  const points = history.filter((h) => h[field] != null)

  if (points.length < 2) {
    return (
      <Card className="p-4">
        <p className="text-sm font-semibold text-text">{label}</p>
        <p className="mt-2 text-xs text-text-secondary">Log this at least twice to see a trend.</p>
      </Card>
    )
  }

  const chartData = points.map((h) => ({
    date: new Date(h.measured_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    value: h[field],
  }))
  const change = Math.round((chartData.at(-1).value - chartData[0].value) * 10) / 10

  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-text">{label}</p>
        <p className="text-sm font-bold text-text">
          {chartData.at(-1).value}
          {unit} <span className="text-xs font-normal text-text-secondary">({change > 0 ? '+' : ''}{change}{unit})</span>
        </p>
      </div>
      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
            <defs>
              <linearGradient id={`fill-${field}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
            <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
            <Tooltip
              contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }}
              formatter={(v) => [`${v}${unit}`, label]}
            />
            <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} fill={`url(#fill-${field})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
