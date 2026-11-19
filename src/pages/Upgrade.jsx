import { useEffect, useState } from 'react'
import { Check, Crown } from 'lucide-react'
import Container from '../components/ui/Container'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { requestUpgrade, getLatestUpgradeRequest } from '../services/premiumService'
import { startPremiumCheckout } from '../services/razorpayService'
import { isDemoMode } from '../services/supabaseClient'

const UPI_ID = 'jeevaninthapa@oksbi'
const PRICE = '₹149/month'

const FREE_FEATURES = ['Dashboard & daily targets', 'Workout templates & logging', 'Food search & meal logging', 'Daily challenges']
const PREMIUM_FEATURES = ['Everything in Free', 'Build custom workout routines', 'Budget-based meal planner', 'Progress photos', 'Full workout history']

export default function Upgrade() {
  const { user, profile } = useAuth()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')
  const [showUpi, setShowUpi] = useState(false)

  useEffect(() => {
    if (!user || isDemoMode) {
      setLoading(false)
      return
    }
    getLatestUpgradeRequest(user.id).then((r) => {
      setRequest(r)
      setLoading(false)
    })
  }, [user])

  const handleRequest = async () => {
    setSubmitting(true)
    const { data, error } = await requestUpgrade(user.id)
    setSubmitting(false)
    if (!error) setRequest(data)
  }

  const handlePay = async () => {
    setPaying(true)
    setPayError('')
    try {
      await startPremiumCheckout({ user })
      window.location.reload()
    } catch (e) {
      if (e.message !== 'cancelled') setPayError(e.message)
    } finally {
      setPaying(false)
    }
  }

  const copyUpi = () => {
    navigator.clipboard.writeText(UPI_ID)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  if (profile?.is_premium) {
    return (
      <Container className="max-w-xl py-10 text-center">
        <Crown size={28} className="mx-auto text-accent" />
        <h2 className="mt-3 text-2xl font-extrabold text-text">You&rsquo;re on Premium</h2>
        <p className="mt-2 text-sm text-text-secondary">All features are unlocked. Thanks for supporting FitTrack AI.</p>
      </Container>
    )
  }

  return (
    <Container className="max-w-xl py-8">
      <h2 className="text-2xl font-extrabold text-text">Upgrade to Premium</h2>
      <p className="mt-1 text-sm text-text-secondary">Unlock routine building, budget meal plans, and progress photos.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm font-semibold text-text-secondary">Free</p>
          <p className="mt-1 text-2xl font-extrabold text-text">₹0</p>
          <ul className="mt-4 flex flex-col gap-2">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                <Check size={15} className="mt-0.5 shrink-0" /> {f}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="border-primary p-5">
          <p className="text-sm font-semibold text-primary">Premium</p>
          <p className="mt-1 text-2xl font-extrabold text-text">{PRICE}</p>
          <ul className="mt-4 flex flex-col gap-2">
            {PREMIUM_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-text">
                <Check size={15} className="mt-0.5 shrink-0 text-primary" /> {f}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-5 p-5">
        {loading ? (
          <p className="text-sm text-text-secondary">Loading…</p>
        ) : request?.status === 'pending' ? (
          <p className="text-sm text-text-secondary">
            Your upgrade request is being reviewed. Once your payment is confirmed, Premium unlocks automatically — no need to ask again.
          </p>
        ) : request?.status === 'rejected' ? (
          <p className="text-sm text-danger">Your last request couldn&rsquo;t be confirmed. If you did pay, please reach out directly.</p>
        ) : (
          <>
            <p className="text-sm font-semibold text-text">Pay securely, unlock instantly</p>
            <p className="mt-1 text-xs text-text-secondary">
              UPI, cards, or netbanking via Razorpay — Premium activates automatically the moment payment succeeds.
            </p>
            <Button onClick={handlePay} disabled={paying || isDemoMode} className="mt-4 w-full">
              {paying ? 'Opening checkout…' : `Pay ${PRICE.split('/')[0]} and unlock Premium`}
            </Button>
            {payError && <p className="mt-2 text-sm font-medium text-danger">{payError}</p>}
            {isDemoMode && <p className="mt-2 text-xs text-text-secondary">Not available in demo mode.</p>}

            <button
              type="button"
              onClick={() => setShowUpi((s) => !s)}
              className="mt-4 text-xs font-medium text-text-secondary underline"
            >
              {showUpi ? 'Hide' : 'Prefer to pay manually via UPI instead?'}
            </button>

            {showUpi && (
              <div className="mt-3 border-t border-border pt-4">
                <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-3.5 py-2.5">
                  <span className="font-mono text-sm text-text">{UPI_ID}</span>
                  <Button size="sm" variant="ghost" onClick={copyUpi}>
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <p className="mt-2 text-xs text-text-secondary">
                  Open GPay/PhonePe/Paytm, send {PRICE.split('/')[0]} to the ID above, then tap below — this needs manual
                  confirmation, so it&rsquo;s slower than the button above.
                </p>
                <Button variant="secondary" size="sm" onClick={handleRequest} disabled={submitting} className="mt-3 w-full">
                  {submitting ? 'Submitting…' : "I've paid via UPI — notify me when it's active"}
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </Container>
  )
}
