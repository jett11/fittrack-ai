import { Link, Outlet } from 'react-router-dom'
import Logo from '../components/landing/Logo'
import Container from '../components/ui/Container'

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <header className="py-6">
        <Container>
          <Link to="/">
            <Logo />
          </Link>
        </Container>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <Outlet />
      </main>
    </div>
  )
}
