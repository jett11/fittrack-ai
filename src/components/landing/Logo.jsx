import { Dumbbell } from 'lucide-react'

export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 font-extrabold text-lg text-text ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground">
        <Dumbbell size={18} strokeWidth={2.4} />
      </span>
      FitTrack <span className="text-primary">AI</span>
    </span>
  )
}
