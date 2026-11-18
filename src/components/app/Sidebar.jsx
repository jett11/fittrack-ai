import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ChevronsLeft, ChevronsRight } from 'lucide-react'
import Logo from '../landing/Logo'
import { navItems } from '../../data/navItems'

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200 lg:flex ${
        collapsed ? 'w-[76px]' : 'w-64'
      }`}
    >
      <div className="flex h-16 items-center px-4">
        {collapsed ? (
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground">
            F
          </span>
        ) : (
          <Logo />
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-[var(--success-soft)] text-primary' : 'text-text-secondary hover:bg-surface-2 hover:text-text'
              }`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={19} className="shrink-0" />
            {!collapsed && item.label}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="m-3 flex items-center justify-center gap-2 rounded-xl border border-border py-2 text-sm text-text-secondary hover:bg-surface-2"
      >
        {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        {!collapsed && 'Collapse'}
      </button>
    </aside>
  )
}
