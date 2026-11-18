const variants = {
  primary:
    'bg-primary text-primary-foreground hover:brightness-105 active:brightness-95 shadow-[0_1px_2px_rgb(16_24_32/8%)]',
  secondary:
    'bg-surface text-text border border-border hover:bg-surface-2',
  accent:
    'bg-accent text-accent-foreground hover:brightness-105 active:brightness-95',
  danger:
    'bg-danger text-white hover:brightness-105 active:brightness-95',
  ghost:
    'bg-transparent text-text-secondary hover:text-text hover:bg-surface-2',
}

const sizes = {
  sm: 'text-sm px-3.5 py-2 gap-1.5',
  md: 'text-[0.95rem] px-5 py-2.5 gap-2',
  lg: 'text-base px-6 py-3.5 gap-2.5',
}

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) {
  return (
    <Component
      className={`inline-flex items-center justify-center rounded-full font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}
