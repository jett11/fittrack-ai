import { useState } from 'react'
import Container from '../components/ui/Container'
import Card from '../components/ui/Card'
import Tabs from '../components/ui/Tabs'
import ChallengeCard from '../components/challenges/ChallengeCard'
import InsightsPanel from '../components/challenges/InsightsPanel'
import { useChallenges } from '../hooks/useChallenges'
import { isDemoMode } from '../services/supabaseClient'

const TABS = [
  { value: 'challenges', label: 'Challenges' },
  { value: 'insights', label: 'Insights' },
]

export default function Challenges() {
  const [tab, setTab] = useState('challenges')
  const { challenges, completions, loading, toggle } = useChallenges()

  const daily = challenges.filter((c) => c.frequency === 'daily')
  const weekly = challenges.filter((c) => c.frequency === 'weekly')

  return (
    <Container className="max-w-2xl py-6 sm:py-8">
      <h2 className="mb-1 text-2xl font-extrabold text-text">Challenges</h2>
      <p className="mb-5 text-sm text-text-secondary">Small, safe daily habits — check them off as you go.</p>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {isDemoMode && (
        <p className="mb-4 mt-4 text-sm text-text-secondary">
          Demo mode doesn&rsquo;t simulate challenges or insights — connect a real account to try this.
        </p>
      )}

      {tab === 'challenges' ? (
        loading ? (
          <p className="mt-5 text-sm text-text-secondary">Loading…</p>
        ) : challenges.length === 0 ? (
          <Card className="mt-5 p-8 text-center text-sm text-text-secondary">No challenges available yet.</Card>
        ) : (
          <div className="mt-5 flex flex-col gap-5">
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
        )
      ) : (
        <div className="mt-5">
          <InsightsPanel />
        </div>
      )}
    </Container>
  )
}
