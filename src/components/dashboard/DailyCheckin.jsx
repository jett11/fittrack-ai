import { Moon, Zap } from 'lucide-react'
import Card from '../ui/Card'

const MOODS = ['😞', '🙁', '😐', '🙂', '😄']
const SLEEP_OPTIONS = [
  { value: 5, label: '<6h' },
  { value: 6.5, label: '6-7h' },
  { value: 7.5, label: '7-8h' },
  { value: 9, label: '8h+' },
]

export default function DailyCheckin({ checkin, onChange }) {
  return (
    <Card className="p-5">
      <p className="mb-3 text-sm font-semibold text-text">Daily check-in</p>

      <div className="mb-4">
        <p className="mb-1.5 flex items-center gap-1.5 text-xs text-text-secondary">
          <Moon size={13} /> Sleep
        </p>
        <div className="flex gap-1.5">
          {SLEEP_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange({ sleepHours: o.value })}
              className={`flex-1 rounded-full py-1.5 text-xs font-semibold transition-colors ${
                checkin.sleepHours === o.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface-2 text-text-secondary hover:text-text'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="mb-1.5 text-xs text-text-secondary">Mood</p>
        <div className="flex gap-1.5">
          {MOODS.map((emoji, i) => {
            const value = i + 1
            return (
              <button
                key={value}
                type="button"
                aria-label={`Mood ${value} of 5`}
                onClick={() => onChange({ mood: value })}
                className={`flex-1 rounded-full py-1.5 text-lg transition-colors ${
                  checkin.mood === value ? 'bg-[var(--success-soft)] ring-2 ring-primary' : 'bg-surface-2 hover:brightness-110'
                }`}
              >
                {emoji}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p className="mb-1.5 flex items-center gap-1.5 text-xs text-text-secondary">
          <Zap size={13} /> Energy
        </p>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              aria-label={`Energy ${value} of 5`}
              onClick={() => onChange({ energy: value })}
              className={`flex-1 rounded-full py-1.5 text-xs font-semibold transition-colors ${
                checkin.energy === value ? 'bg-primary text-primary-foreground' : 'bg-surface-2 text-text-secondary hover:text-text'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
    </Card>
  )
}
