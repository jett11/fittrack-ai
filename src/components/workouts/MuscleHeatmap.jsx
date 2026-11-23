function statusFor(entry) {
  if (!entry) return { fill: 'var(--surface-2)', label: 'Not trained yet' }
  const d = entry.daysSinceTrained
  if (d <= 2) return { fill: 'var(--primary)', label: d <= 0 ? 'Trained today' : `Trained ${d}d ago` }
  if (d <= 6) return { fill: 'var(--accent)', label: `Trained ${d}d ago — recovered` }
  return { fill: 'var(--surface-2)', label: `${d}d since last trained` }
}

function Region({ d, ...props }) {
  return <rect rx={8} ry={8} fill={d.fill} opacity={d.fill === 'var(--surface-2)' ? 1 : 0.9} {...props} />
}

export default function MuscleHeatmap({ distribution }) {
  const byGroup = Object.fromEntries(distribution.map((d) => [d.group, d]))
  const of = (group) => statusFor(byGroup[group])

  return (
    <div>
      <svg viewBox="0 0 220 240" className="mx-auto w-full max-w-xs" role="img" aria-label="Recently trained muscle groups, front and back">
        {/* Front */}
        <circle cx={55} cy={20} r={13} fill="var(--surface-2)" />
        <Region d={of('Shoulders')} x={18} y={40} width={26} height={16} />
        <Region d={of('Shoulders')} x={66} y={40} width={26} height={16} />
        <Region d={of('Chest')} x={34} y={44} width={42} height={30} />
        <Region d={of('Arms')} x={8} y={44} width={16} height={78} />
        <Region d={of('Arms')} x={86} y={44} width={16} height={78} />
        <Region d={of('Core')} x={37} y={76} width={36} height={36} />
        <Region d={of('Legs')} x={30} y={114} width={20} height={100} />
        <Region d={of('Legs')} x={60} y={114} width={20} height={100} />

        {/* Back */}
        <circle cx={165} cy={20} r={13} fill="var(--surface-2)" />
        <Region d={of('Shoulders')} x={128} y={40} width={26} height={16} />
        <Region d={of('Shoulders')} x={176} y={40} width={26} height={16} />
        <Region d={of('Back')} x={144} y={44} width={42} height={46} />
        <Region d={of('Arms')} x={118} y={44} width={16} height={78} />
        <Region d={of('Arms')} x={196} y={44} width={16} height={78} />
        <Region d={of('Glutes')} x={147} y={92} width={36} height={22} />
        <Region d={of('Legs')} x={140} y={114} width={20} height={100} />
        <Region d={of('Legs')} x={170} y={114} width={20} height={100} />
      </svg>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-text-secondary">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--primary)' }} /> Recently trained
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--accent)' }} /> Recovered, ready
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border border-border" style={{ background: 'var(--surface-2)' }} /> Not trained recently
        </span>
      </div>
    </div>
  )
}
