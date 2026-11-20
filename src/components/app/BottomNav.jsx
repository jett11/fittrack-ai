import { NavLink } from 'react-router-dom'
import { mobileNavItems } from '../../data/navItems'

export default function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {mobileNavItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 py-2.5 text-[0.68rem] font-medium transition-colors duration-150 ${
              isActive ? 'text-primary' : 'text-text-secondary'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={`flex items-center justify-center rounded-full px-3 py-1 transition-colors duration-150 ${
                  isActive ? 'bg-success-soft' : ''
                }`}
              >
                <item.icon size={20} />
              </span>
              {item.label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
