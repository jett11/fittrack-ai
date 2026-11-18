import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

export default function RestTimer({ seconds, onDismiss }) {
  const [remaining, setRemaining] = useState(seconds)
  const intervalRef = useRef(null)

  useEffect(() => {
    setRemaining(seconds)
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current)
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [seconds])

  const pct = Math.max(0, Math.round((remaining / seconds) * 100))

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 flex justify-center px-4 lg:bottom-4">
      <div className="flex w-full max-w-sm items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
        <div className="relative h-11 w-11 shrink-0">
          <svg viewBox="0 0 40 40" className="h-full w-full -rotate-90">
            <circle cx="20" cy="20" r="17" fill="none" stroke="var(--surface-2)" strokeWidth="4" />
            <circle
              cx="20"
              cy="20"
              r="17"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="4"
              strokeDasharray={2 * Math.PI * 17}
              strokeDashoffset={2 * Math.PI * 17 * (1 - pct / 100)}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-xs font-bold text-text">{remaining}</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-text">Resting</p>
          <p className="text-xs text-text-secondary">Next set coming up</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Skip rest"
          className="grid h-8 w-8 place-items-center rounded-full text-text-secondary hover:bg-surface-2"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
