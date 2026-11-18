import { Droplets, Flame, TrendingUp } from 'lucide-react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'

export default function DashboardPreview() {
  return (
    <Card className="relative mx-auto w-full max-w-xl overflow-hidden p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-text-secondary">Good morning, Aditi</p>
          <p className="font-semibold text-text">Today&rsquo;s overview</p>
        </div>
        <Badge tone="sample">Sample preview</Badge>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-[var(--radius-card-sm)] bg-surface-2 p-3.5">
          <Flame size={16} className="mb-2 text-primary" />
          <p className="text-lg font-bold leading-none text-text">1,840</p>
          <p className="mt-1 text-xs text-text-secondary">kcal target</p>
        </div>
        <div className="rounded-[var(--radius-card-sm)] bg-surface-2 p-3.5">
          <Droplets size={16} className="mb-2 text-primary" />
          <p className="text-lg font-bold leading-none text-text">5/8</p>
          <p className="mt-1 text-xs text-text-secondary">glasses water</p>
        </div>
        <div className="rounded-[var(--radius-card-sm)] bg-surface-2 p-3.5">
          <TrendingUp size={16} className="mb-2 text-primary" />
          <p className="text-lg font-bold leading-none text-text">-1.2kg</p>
          <p className="mt-1 text-xs text-text-secondary">this month</p>
        </div>
      </div>

      <div className="mt-4 rounded-[var(--radius-card-sm)] border border-border p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-text">Weekly consistency</p>
          <p className="text-sm font-bold text-primary">86%</p>
        </div>
        <div className="flex h-9 items-end gap-2">
          {[40, 65, 50, 80, 95, 70, 86].map((h, i) => (
            <div key={i} className="flex h-full flex-1 items-end rounded-full bg-surface-2">
              <div className="w-full rounded-full bg-primary" style={{ height: `${h}%` }} />
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
