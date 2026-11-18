export default function Chip({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
        selected
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-surface text-text-secondary hover:bg-surface-2'
      }`}
    >
      {children}
    </button>
  )
}
