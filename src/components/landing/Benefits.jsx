import { CheckCircle2 } from 'lucide-react'
import Container from '../ui/Container'
import { benefits } from '../../data/landingContent'

export default function Benefits() {
  return (
    <section id="about" className="py-20 sm:py-28">
      <Container className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
            Built for how India actually eats and trains
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            Most fitness apps are built around Western food and Western gym
            culture. FitTrack AI starts from roti, dal and home workouts
            instead of treating them as an afterthought.
          </p>
        </div>
        <ul className="flex flex-col gap-4">
          {benefits.map((b) => (
            <li key={b} className="flex items-start gap-3">
              <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-primary" />
              <span className="text-[0.95rem] text-text">{b}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
