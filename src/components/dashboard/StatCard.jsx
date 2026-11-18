import Card from '../ui/Card'

export default function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--success-soft)] text-primary">
        <Icon size={17} />
      </div>
      <p className="mt-3 text-xl font-extrabold leading-none text-text sm:text-2xl">{value}</p>
      <p className="mt-1 text-xs text-text-secondary">{label}</p>
      {sub && <p className="mt-0.5 text-[0.7rem] text-text-secondary">{sub}</p>}
    </Card>
  )
}
