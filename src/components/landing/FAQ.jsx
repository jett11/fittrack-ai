import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Container from '../ui/Container'
import { faqs } from '../../data/landingContent'

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border py-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 text-left"
        aria-expanded={open}
      >
        <span className="font-semibold text-text">{question}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-text-secondary transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <p className="mt-3 text-sm leading-relaxed text-text-secondary">{answer}</p>}
    </div>
  )
}

export default function FAQ() {
  return (
    <section className="bg-surface-2 py-20 sm:py-28">
      <Container className="max-w-3xl">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
          Frequently asked questions
        </h2>
        <div className="mt-10">
          {faqs.map((f) => (
            <FAQItem key={f.question} {...f} />
          ))}
        </div>
      </Container>
    </section>
  )
}
