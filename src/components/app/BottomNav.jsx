import { NavLink } from 'react-router-dom'
import { mobileNavItems } from '../../data/navItems'

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface/95 backdrop-blur-md lg:hidden">
      {mobileNavItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 py-2.5 text-[0.68rem] font-medium ${
              isActive ? 'text-primary' : 'text-text-secondary'
            }`
          }
        >
          <item.icon size={20} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
