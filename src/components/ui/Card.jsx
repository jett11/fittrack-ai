export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-card)] ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
