import Container from '../components/ui/Container'

export default function PrivacyPolicy() {
  return (
    <Container className="max-w-3xl py-16">
      <h1 className="text-3xl font-extrabold text-text">Privacy Policy</h1>
      <p className="mt-2 text-sm text-text-secondary">Last updated: {new Date().getFullYear()}</p>

      <div className="mt-8 flex flex-col gap-6 text-[0.95rem] leading-relaxed text-text-secondary">
        <section>
          <h2 className="mb-2 text-lg font-bold text-text">What we collect</h2>
          <p>
            We collect the profile information you provide during onboarding (such as age,
            height, weight and fitness goal), the workouts, meals and measurements you log,
            and any progress photos you choose to upload. We collect only what&rsquo;s needed
            to run the features you use.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-bold text-text">How it&rsquo;s used</h2>
          <p>
            Your data is used to calculate your personal targets (calories, protein, etc.),
            show your dashboard and progress charts, and let you pick up where you left off.
            We do not sell your personal data.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-bold text-text">Progress photos</h2>
          <p>
            Progress photos are private by default and visible only to your account. You can
            delete individual photos at any time from the Transformation page.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-bold text-text">Your controls</h2>
          <p>
            You can update your profile at any time from Settings, export your data, or
            permanently delete your account and all associated data.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-bold text-text">Contact</h2>
          <p>
            Questions about this policy can be sent to{' '}
            <a href="mailto:hello@fittrack.ai" className="text-primary underline">
              hello@fittrack.ai
            </a>
            .
          </p>
        </section>
      </div>
    </Container>
  )
}
