import { Outlet } from 'react-router-dom'
import Navbar from '../components/landing/Navbar'
import Footer from '../components/landing/Footer'

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
