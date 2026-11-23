import { Trophy, Check } from 'lucide-react'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function currentWeekDays() {
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - now.getDay())
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

export default function HeroChallengeCard({ challenges, completions, onToggle }) {
  const today = todayStr()
  const next = challenges.find(
    (c) => !completions.some((comp) => comp.challenge_id === c.id && comp.completed_date === today)
  )

  if (!next) return null

  const isDone = completions.some((c) => c.challenge_id === next.id && c.completed_date === today)
  const days = currentWeekDays()

  return (
    <div
      className="rounded-[var(--radius-card-lg)] p-5 text-accent-foreground"
      style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
    >
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-accent-foreground/10">
          <Trophy size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
            {next.frequency === 'weekly' ? 'Weekly challenge' : "Today's challenge"}
          </p>
          <p className="truncate text-base font-extrabold">{next.title}</p>
        </div>
        <button
          type="button"
          onClick={() => onToggle(next.id)}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-accent-foreground px-4 py-2 text-sm font-bold text-accent"
        >
          {isDone ? <Check size={15} /> : null}
          {isDone ? 'Done' : 'Start'}
        </button>
      </div>

      <div className="mt-4 flex justify-between">
        {days.map((d) => {
          const isToday = d.toISOString().slice(0, 10) === today
          return (
            <div key={d.toISOString()} className="flex flex-col items-center gap-1">
              <span className="text-[0.65rem] font-semibold uppercase opacity-70">
                {d.toLocaleDateString('en-IN', { weekday: 'narrow' })}
              </span>
              <span
                className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
                  isToday ? 'bg-accent-foreground text-accent' : 'bg-accent-foreground/10'
                }`}
              >
                {d.getDate()}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
