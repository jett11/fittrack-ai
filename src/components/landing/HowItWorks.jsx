import Container from '../ui/Container'
import { steps } from '../../data/landingContent'

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-surface-2 py-20 sm:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-lg text-text-secondary">
            Three steps, and you&rsquo;re tracking &mdash; no complicated setup.
          </p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title} className="relative">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-primary font-bold text-primary-foreground">
                {i + 1}
              </div>
              <h3 className="mt-4 text-lg font-bold text-text">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{step.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
