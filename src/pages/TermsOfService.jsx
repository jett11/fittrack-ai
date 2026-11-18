import Container from '../components/ui/Container'

export default function TermsOfService() {
  return (
    <Container className="max-w-3xl py-16">
      <h1 className="text-3xl font-extrabold text-text">Terms of Service</h1>
      <p className="mt-2 text-sm text-text-secondary">Last updated: {new Date().getFullYear()}</p>

      <div className="mt-8 flex flex-col gap-6 text-[0.95rem] leading-relaxed text-text-secondary">
        <section>
          <h2 className="mb-2 text-lg font-bold text-text">Not medical advice</h2>
          <p>
            FitTrack AI provides general fitness and nutrition information and estimates for
            everyday tracking. It is not medical, dietary or clinical advice. Consult a
            qualified professional before starting a new exercise or diet program, especially
            if you have an existing health condition.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-bold text-text">Your account</h2>
          <p>
            You&rsquo;re responsible for keeping your login credentials secure. You may delete
            your account at any time from Settings.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-bold text-text">Free features</h2>
          <p>
            Core features are free to use. Additional premium features may be introduced in
            the future as optional paid upgrades; we will not retroactively lock features you
            already use for free behind a paywall.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-bold text-text">Acceptable use</h2>
          <p>
            Don&rsquo;t attempt to access another user&rsquo;s data, misuse the service, or use
            it in a way that could harm other users or the platform.
          </p>
        </section>
      </div>
    </Container>
  )
}
