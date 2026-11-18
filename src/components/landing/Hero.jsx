import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Container from '../ui/Container'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import DashboardPreview from './DashboardPreview'

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 pb-20 sm:pt-20 sm:pb-28">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] opacity-60"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 0%, var(--surface-2), transparent 70%)',
        }}
      />
      <Container className="grid items-center gap-14 lg:grid-cols-2 lg:gap-10">
        <div>
          <Badge tone="primary">Free to start &middot; Built for India</Badge>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-text sm:text-5xl lg:text-[3.25rem]">
            Your fitness journey.
            <br />
            Smarter, simpler, <span className="text-primary">stronger.</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg text-text-secondary">
            Your personal fitness companion for workouts, nutrition and
            transformation &mdash; with an Indian food database built in.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button as={Link} to="/signup" size="lg">
              Start for free
              <ArrowRight size={18} />
            </Button>
            <Button as="a" href="#features" variant="secondary" size="lg">
              Explore features
            </Button>
          </div>
          <p className="mt-4 text-sm text-text-secondary">
            No credit card needed. Core features are free while we build this together.
          </p>
        </div>

        <DashboardPreview />
      </Container>
    </section>
  )
}
