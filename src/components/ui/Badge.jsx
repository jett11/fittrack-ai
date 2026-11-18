const tones = {
  neutral: 'bg-surface-2 text-text-secondary',
  primary: 'bg-[var(--success-soft)] text-primary',
  sample: 'bg-surface-2 text-text-secondary border border-dashed border-border',
}

export default function Badge({ tone = 'neutral', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
