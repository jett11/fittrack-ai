import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, Moon, Sun } from 'lucide-react'
import Logo from './Logo'
import Button from '../ui/Button'
import Container from '../ui/Container'
import { useTheme } from '../../hooks/useTheme'

const links = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'About', href: '#about' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <Link to="/" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-secondary transition-colors hover:text-text"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center rounded-full border border-border text-text-secondary transition-colors hover:text-text"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <Button as={Link} to="/login" variant="ghost" size="sm">
            Login
          </Button>
          <Button as={Link} to="/signup" variant="primary" size="sm">
            Get started free
          </Button>
        </div>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-full text-text md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </Container>

      {open && (
        <div className="border-t border-border bg-bg md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-2 hover:text-text"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex items-center gap-3 px-3">
              <Button
                as={Link}
                to="/login"
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                Login
              </Button>
              <Button
                as={Link}
                to="/signup"
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                Get started
              </Button>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-2 hover:text-text"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
          </Container>
        </div>
      )}
    </header>
  )
}
