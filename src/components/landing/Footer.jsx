import { Link } from 'react-router-dom'
import Container from '../ui/Container'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <Container className="flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-text-secondary">
            Your fitness journey. Smarter, simpler, stronger.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-secondary">
          <Link to="/privacy" className="hover:text-text">Privacy</Link>
          <Link to="/terms" className="hover:text-text">Terms</Link>
          <a href="mailto:hello@fittrack.ai" className="hover:text-text">Contact</a>
        </nav>
      </Container>
      <Container className="mt-8 border-t border-border pt-6 text-xs text-text-secondary">
        &copy; {new Date().getFullYear()} FitTrack AI. All estimates are for general guidance and are not medical advice.
      </Container>
    </footer>
  )
}
