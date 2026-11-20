import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import Card from '../ui/Card'

const COLORS = { Protein: 'var(--primary)', Carbs: 'var(--accent)', Fat: 'var(--danger)' }

export default function MacroDonut({ protein_g, carbs_g, fat_g }) {
  const data = [
    { name: 'Protein', grams: Math.round(protein_g) },
    { name: 'Carbs', grams: Math.round(carbs_g) },
    { name: 'Fat', grams: Math.round(fat_g) },
  ].filter((d) => d.grams > 0)

  const total = data.reduce((s, d) => s + d.grams, 0)

  return (
    <Card className="p-5">
      <p className="mb-3 text-sm font-semibold text-text">Macro distribution</p>
      {total === 0 ? (
        <p className="py-6 text-center text-sm text-text-secondary">Log a meal to see your macro split.</p>
      ) : (
        <div className="flex items-center gap-4">
          <div className="h-32 w-32 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="grams" nameKey="name" innerRadius={38} outerRadius={56} paddingAngle={2}>
                  {data.map((d) => (
                    <Cell key={d.name} fill={COLORS[d.name]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                  formatter={(value, name) => [`${value}g`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2">
            {data.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[d.name] }} />
                <span className="text-text-secondary">{d.name}</span>
                <span className="font-semibold text-text">
                  {d.grams}g ({Math.round((d.grams / total) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
