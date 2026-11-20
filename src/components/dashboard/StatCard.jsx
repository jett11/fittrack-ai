import Card from '../ui/Card'

const TONES = {
  primary: { bg: 'var(--success-soft)', fg: 'var(--primary)' },
  calories: { bg: 'rgb(249 115 22 / 16%)', fg: '#f97316' },
  water: { bg: 'rgb(56 189 248 / 16%)', fg: '#38bdf8' },
  scale: { bg: 'rgb(168 85 247 / 16%)', fg: '#a855f7' },
}

export default function StatCard({ icon: Icon, label, value, sub, tone = 'primary' }) {
  const { bg, fg } = TONES[tone] ?? TONES.primary
  return (
    <Card className="p-4 sm:p-5">
      <div className="grid h-9 w-9 place-items-center rounded-xl" style={{ backgroundColor: bg, color: fg }}>
        <Icon size={17} />
      </div>
      <p className="mt-3 text-2xl font-extrabold leading-none tracking-tight text-text sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-text-secondary">{label}</p>
      {sub && <p className="mt-0.5 text-[0.7rem] text-text-secondary">{sub}</p>}
    </Card>
  )
}
