import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import Container from '../components/ui/Container'

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">404</p>
      <h1 className="mt-2 text-3xl font-extrabold text-text">Page not found</h1>
      <p className="mt-3 max-w-sm text-text-secondary">
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.
      </p>
      <Button as={Link} to="/" className="mt-6">
        Back to home
      </Button>
    </Container>
  )
}
