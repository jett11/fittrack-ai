import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import DemoModeBanner from '../components/ui/DemoModeBanner'
import Sidebar from '../components/app/Sidebar'
import BottomNav from '../components/app/BottomNav'
import AppHeader from '../components/app/AppHeader'
import PageTransition from '../components/app/PageTransition'
import NewUserTour from '../components/app/NewUserTour'
import { navItems } from '../data/navItems'
import { useAuth } from '../hooks/useAuth'
import { prefetchMainRoutes } from '../utils/prefetchRoutes'

export default function AppLayout() {
  const location = useLocation()
  const { profile } = useAuth()
  const current = navItems.find((n) => location.pathname.startsWith(n.to))

  useEffect(() => {
    prefetchMainRoutes()
  }, [])

  if (profile && !profile.onboarding_completed) {
    return <Navigate to="/onboarding" replace />
  }

  return (
    <div className="flex min-h-screen bg-bg text-text">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DemoModeBanner />
        <AppHeader title={current?.label ?? 'FitTrack AI'} />
        <main className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">
          <PageTransition />
        </main>
      </div>
      <BottomNav />
      <NewUserTour />
    </div>
  )
}
