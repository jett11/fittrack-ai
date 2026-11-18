export default function Input({ label, error, className = '', id, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-[0.95rem] text-text outline-none transition-colors placeholder:text-text-secondary focus:border-primary ${
          error ? 'border-danger' : 'border-border'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs font-medium text-danger">{error}</p>}
    </div>
  )
}
