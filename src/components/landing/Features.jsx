import { Dumbbell, Utensils, Wallet, TrendingUp, Flame } from 'lucide-react'
import Container from '../ui/Container'
import Card from '../ui/Card'
import { features } from '../../data/landingContent'

const icons = { Dumbbell, Utensils, Wallet, TrendingUp, Flame }

export default function Features() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
            Everything you need, nothing you don&rsquo;t
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            Five focused tools that work together, instead of a dashboard full of things you&rsquo;ll never open.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = icons[f.icon]
            return (
              <Card
                key={f.key}
                className={`p-6 transition-transform duration-200 hover:-translate-y-0.5 ${
                  i === 0 ? 'lg:col-span-2' : ''
                }`}
              >
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--success-soft)] text-primary">
                  <Icon size={22} strokeWidth={2.2} />
                </div>
                <h3 className="mt-4 text-lg font-bold text-text">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{f.description}</p>
              </Card>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
