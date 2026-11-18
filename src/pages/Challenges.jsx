import Container from '../components/ui/Container'
import Card from '../components/ui/Card'
import ChallengeCard from '../components/challenges/ChallengeCard'
import { useChallenges } from '../hooks/useChallenges'
import { isDemoMode } from '../services/supabaseClient'

export default function Challenges() {
  const { challenges, completions, loading, toggle } = useChallenges()

  const daily = challenges.filter((c) => c.frequency === 'daily')
  const weekly = challenges.filter((c) => c.frequency === 'weekly')

  return (
    <Container className="max-w-2xl py-6 sm:py-8">
      <h2 className="mb-1 text-2xl font-extrabold text-text">Challenges</h2>
      <p className="mb-5 text-sm text-text-secondary">Small, safe daily habits — check them off as you go.</p>

      {isDemoMode && (
        <p className="mb-4 text-sm text-text-secondary">Demo mode doesn&rsquo;t simulate challenges — connect a real account to try this.</p>
      )}

      {loading ? (
        <p className="text-sm text-text-secondary">Loading…</p>
      ) : challenges.length === 0 ? (
        <Card className="p-8 text-center text-sm text-text-secondary">No challenges available yet.</Card>
      ) : (
        <div className="flex flex-col gap-5">
          <div>
            <p className="mb-2 text-sm font-semibold text-text">Daily</p>
            <div className="flex flex-col gap-2.5">
              {daily.map((c) => (
                <ChallengeCard key={c.id} challenge={c} completions={completions} onToggle={toggle} />
              ))}
            </div>
          </div>
          {weekly.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-semibold text-text">Weekly</p>
              <div className="flex flex-col gap-2.5">
                {weekly.map((c) => (
                  <ChallengeCard key={c.id} challenge={c} completions={completions} onToggle={toggle} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Container>
  )
}
