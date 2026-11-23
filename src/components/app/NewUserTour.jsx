import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Flame, Dumbbell, Utensils, TrendingUp, Trophy, X } from 'lucide-react'
import Button from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'

const SLIDES = [
  {
    icon: Flame,
    title: 'Your daily snapshot',
    body: 'Dashboard shows calories, water, and today’s workout at a glance.',
  },
  {
    icon: Dumbbell,
    title: 'Workouts, your way',
    body: 'Browse templates or build a custom routine, then log every set as you train.',
  },
  {
    icon: Utensils,
    title: 'Indian food, real prices',
    body: 'Search Indian foods and meals that fit your budget, down to the rupee.',
  },
  {
    icon: TrendingUp,
    title: 'Watch your progress',
    body: 'Log photos and measurements, and unlock milestones as you hit them.',
  },
  {
    icon: Trophy,
    title: 'Daily challenges',
    body: 'Build streaks with small daily habits and get insights from your own data.',
  },
]

const tourKey = (userId) => `fittrack_tour_seen_${userId}`

export default function NewUserTour() {
  const { user, profile } = useAuth()
  const [step, setStep] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!user || !profile?.onboarding_completed) return
    if (localStorage.getItem(tourKey(user.id))) return
    setOpen(true)
  }, [user, profile?.onboarding_completed])

  const close = () => {
    if (user) localStorage.setItem(tourKey(user.id), '1')
    setOpen(false)
  }

  if (!open) return null

  const slide = SLIDES[step]
  const isLast = step === SLIDES.length - 1
  const Icon = slide.icon

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-sm rounded-t-3xl bg-surface p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-[var(--shadow-card)] sm:rounded-3xl"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close tour"
          className="ml-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-2 hover:text-text"
        >
          <X size={16} />
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
            className="text-center"
          >
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-success-soft text-primary">
              <Icon size={26} />
            </div>
            <h3 className="mt-4 text-lg font-extrabold text-text">{slide.title}</h3>
            <p className="mt-1.5 text-sm text-text-secondary">{slide.body}</p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex items-center justify-center gap-1.5">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-primary' : 'w-1.5 bg-surface-2'}`}
            />
          ))}
        </div>

        <div className="mt-6 flex items-center gap-2">
          {!isLast && (
            <Button variant="ghost" size="sm" onClick={close} className="flex-1">
              Skip
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => (isLast ? close() : setStep((s) => s + 1))}
            className={isLast ? 'w-full' : 'flex-1'}
          >
            {isLast ? 'Get started' : 'Next'}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
