import Card from '../ui/Card'

const SIZE = 148
const STROKE = 12
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function CalorieRing({ consumed, target }) {
  const pct = target ? Math.min(1, consumed / target) : 0
  const remaining = target ? Math.max(0, Math.round(target - consumed)) : null
  const over = target ? consumed > target : false
  const offset = CIRCUMFERENCE * (1 - pct)

  return (
    <Card className="flex flex-col items-center gap-4 p-5 sm:flex-row sm:items-center sm:justify-around">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} strokeWidth={STROKE} className="stroke-surface-2" fill="none" />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            strokeWidth={STROKE}
            fill="none"
            stroke={over ? 'var(--danger)' : 'var(--primary)'}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.4s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-extrabold leading-none text-text">{Math.round(consumed).toLocaleString('en-IN')}</p>
          <p className="mt-1 text-[0.7rem] text-text-secondary">of {target ? target.toLocaleString('en-IN') : '—'} kcal</p>
        </div>
      </div>
      <div className="text-center sm:text-left">
        <p className="text-sm font-semibold text-text">
          {target == null
            ? 'Complete onboarding to set a calorie target'
            : over
              ? `${Math.round(consumed - target).toLocaleString('en-IN')} kcal over target`
              : `${remaining.toLocaleString('en-IN')} kcal remaining`}
        </p>
        <p className="mt-1 text-xs text-text-secondary">Estimate based on your profile, not medical advice</p>
      </div>
    </Card>
  )
}
