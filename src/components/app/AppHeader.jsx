import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Moon, Sun, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'

export default function AppHeader({ title }) {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-bg/90 px-4 backdrop-blur-md sm:px-6">
      <h1 className="text-lg font-bold text-text">{title}</h1>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="grid h-9 w-9 place-items-center rounded-full text-text-secondary hover:bg-surface-2 hover:text-text"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-surface-2"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {user?.email?.[0]?.toUpperCase() ?? '?'}
            </span>
            <ChevronDown size={14} className="text-text-secondary" />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-surface p-1.5 shadow-[var(--shadow-card)]"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <p className="truncate px-2.5 py-2 text-xs text-text-secondary">{user?.email}</p>
              <Link
                to="/settings"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-2.5 py-2 text-sm text-text hover:bg-surface-2"
              >
                Settings
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-danger hover:bg-surface-2"
              >
                <LogOut size={14} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
