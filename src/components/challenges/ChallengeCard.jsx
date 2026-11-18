import { CheckCircle2, Circle, Flame, Droplets, Footprints, ListChecks } from 'lucide-react'
import Card from '../ui/Card'
import { calculateStreak, completionsThisWeek, earnedBadges } from '../../services/challengeService'

const ICONS = { water: Droplets, steps: Footprints, workout: Flame, habit: ListChecks }

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function ChallengeCard({ challenge, completions, onToggle }) {
  const Icon = ICONS[challenge.category] ?? ListChecks
  const isDoneToday = completions.some((c) => c.challenge_id === challenge.id && c.completed_date === todayStr())
  const streak = calculateStreak(completions, challenge.id)
  const weekCount = completionsThisWeek(completions, challenge.id)
  const badges = earnedBadges(streak)

  return (
    <Card className="flex items-center gap-4 p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--success-soft)] text-primary">
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text">{challenge.title}</p>
        <p className="truncate text-xs text-text-secondary">{challenge.description}</p>
        <div className="mt-1 flex items-center gap-2 text-xs">
          {challenge.frequency === 'weekly' ? (
            <span className="font-medium text-primary">{weekCount}/{challenge.target_value} this week</span>
          ) : (
            <span className="font-medium text-primary">{streak} day streak</span>
          )}
          {badges.map((b) => (
            <span key={b.label} title={b.label}>
              {b.icon}
            </span>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onToggle(challenge.id)}
        aria-label={isDoneToday ? 'Mark not done' : 'Mark done today'}
        className="shrink-0"
      >
        {isDoneToday ? <CheckCircle2 size={26} className="text-primary" /> : <Circle size={26} className="text-text-secondary" />}
      </button>
    </Card>
  )
}
