export default function ChoiceCard({ selected, onClick, title, description, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex items-start gap-3 rounded-[var(--radius-card-sm)] border p-4 text-left transition-colors ${
        selected
          ? 'border-primary bg-[var(--success-soft)]'
          : 'border-border bg-surface hover:bg-surface-2'
      }`}
    >
      {Icon && (
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
            selected ? 'bg-primary text-primary-foreground' : 'bg-surface-2 text-text-secondary'
          }`}
        >
          <Icon size={17} />
        </span>
      )}
      <span>
        <span className="block text-sm font-semibold text-text">{title}</span>
        {description && (
          <span className="mt-0.5 block text-xs text-text-secondary">{description}</span>
        )}
      </span>
    </button>
  )
}
