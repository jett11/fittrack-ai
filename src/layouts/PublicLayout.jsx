import Navbar from '../components/landing/Navbar'
import Footer from '../components/landing/Footer'
import PageTransition from '../components/app/PageTransition'

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <Navbar />
      <main className="flex-1">
        <PageTransition />
      </main>
      <Footer />
    </div>
  )
}
