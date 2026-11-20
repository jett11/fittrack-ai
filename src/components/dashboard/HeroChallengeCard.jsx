import { Trophy, Check } from 'lucide-react'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function HeroChallengeCard({ challenges, completions, onToggle }) {
  const today = todayStr()
  const next = challenges.find(
    (c) => !completions.some((comp) => comp.challenge_id === c.id && comp.completed_date === today)
  )

  if (!next) return null

  const isDone = completions.some((c) => c.challenge_id === next.id && c.completed_date === today)

  return (
    <div className="flex items-center gap-4 rounded-[var(--radius-card-lg)] bg-accent p-5 text-accent-foreground">
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
        {isDone ? 'Done' : 'Mark done'}
      </button>
    </div>
  )
}
