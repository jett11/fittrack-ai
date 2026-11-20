import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { Trophy, Flame, Clock, CalendarCheck } from 'lucide-react'
import Card from '../ui/Card'
import { getWorkoutAnalytics } from '../../services/workoutService'

function StatTile({ icon: Icon, value, label }) {
  return (
    <Card className="p-4">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--success-soft)] text-primary">
        <Icon size={17} />
      </div>
      <p className="mt-3 text-xl font-extrabold leading-none text-text">{value}</p>
      <p className="mt-1 text-xs text-text-secondary">{label}</p>
    </Card>
  )
}

export default function WorkoutAnalytics({ userId }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    let active = true
    getWorkoutAnalytics(userId).then((d) => {
      if (active) setData(d)
    })
    return () => {
      active = false
    }
  }, [userId])

  if (!data) return <p className="text-sm text-text-secondary">Loading…</p>

  if (data.totalWorkouts === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-text-secondary">Not enough data yet — complete a few workouts to see your analytics.</p>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={Trophy} value={data.totalWorkouts} label="Total workouts completed" />
        <StatTile icon={CalendarCheck} value={`${data.weeklyFrequency}/7`} label="Workouts in the last 7 days" />
        <StatTile
          icon={Clock}
          value={data.totalMinutes ? `${Math.round(data.totalMinutes / 60)}h ${data.totalMinutes % 60}m` : '—'}
          label="Total training time"
        />
        <StatTile icon={Flame} value={data.personalRecords.length} label="Exercises with a logged PR" />
      </div>

      {data.muscleGroupDistribution.length > 0 && (
        <Card className="p-5">
          <p className="mb-3 text-sm font-semibold text-text">Muscle group distribution</p>
          <p className="mb-3 text-xs text-text-secondary">Based on completed sets logged across all your sessions</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.muscleGroupDistribution}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="group"
                  axisLine={false}
                  tickLine={false}
                  width={90}
                  tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ fill: 'var(--surface-2)' }}
                  contentStyle={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                  formatter={(value) => [`${value} sets`, '']}
                />
                <Bar dataKey="sets" fill="var(--primary)" radius={[0, 6, 6, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {data.personalRecords.length > 0 && (
        <Card className="p-5">
          <p className="mb-3 text-sm font-semibold text-text">Personal records</p>
          <p className="mb-3 text-xs text-text-secondary">Heaviest logged weight per exercise — not a lab-measured max</p>
          <div className="flex flex-col divide-y divide-border">
            {data.personalRecords.map((pr) => (
              <div key={pr.name} className="flex items-center justify-between py-2.5 text-sm">
                <span className="font-medium text-text">{pr.name}</span>
                <span className="font-bold text-text">
                  {pr.weight}kg{pr.reps ? ` × ${pr.reps}` : ''}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
