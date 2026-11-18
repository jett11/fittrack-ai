import { Droplets, Minus, Plus } from 'lucide-react'
import Card from '../ui/Card'

const TARGET = 8

export default function WaterTracker({ glasses, onChange }) {
  const pct = Math.min(100, Math.round((glasses / TARGET) * 100))

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Droplets size={17} className="text-primary" />
          <p className="text-sm font-semibold text-text">Water intake</p>
        </div>
        <p className="text-sm font-bold text-text">
          {glasses}
          <span className="text-text-secondary">/{TARGET} glasses</span>
        </p>
      </div>

      <div className="mt-3 flex gap-1.5">
        {Array.from({ length: TARGET }).map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Set to ${i + 1} glasses`}
            onClick={() => onChange(i + 1 === glasses ? i : i + 1)}
            className="h-6 flex-1 rounded-md transition-colors"
            style={{ backgroundColor: i < glasses ? 'var(--primary)' : 'var(--surface-2)' }}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-text-secondary">{pct}% of today&rsquo;s goal</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onChange(Math.max(0, glasses - 1))}
            aria-label="Remove a glass"
            className="grid h-8 w-8 place-items-center rounded-full border border-border text-text-secondary hover:bg-surface-2"
          >
            <Minus size={14} />
          </button>
          <button
            type="button"
            onClick={() => onChange(glasses + 1)}
            aria-label="Add a glass"
            className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground hover:brightness-105"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </Card>
  )
}
