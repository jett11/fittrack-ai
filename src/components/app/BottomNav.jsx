import { NavLink } from 'react-router-dom'
import { mobileNavItems } from '../../data/navItems'

const HERO_INDEX = Math.floor(mobileNavItems.length / 2)

export default function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {mobileNavItems.map((item, i) =>
        i === HERO_INDEX ? (
          <NavLink key={item.to} to={item.to} className="relative flex flex-1 flex-col items-center">
            {({ isActive }) => (
              <span
                className={`absolute -top-6 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_6px_16px_rgb(24_199_138/35%)] transition-transform duration-150 ${
                  isActive ? 'scale-105' : ''
                }`}
              >
                <item.icon size={24} />
              </span>
            )}
          </NavLink>
        ) : (
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
        )
      )}
    </nav>
  )
}
