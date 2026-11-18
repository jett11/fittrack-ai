export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-full bg-surface-2 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
            active === tab.value ? 'bg-surface text-primary shadow-sm' : 'text-text-secondary hover:text-text'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
