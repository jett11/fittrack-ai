import { useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setSubmitting(true)
    const { error: resetError } = await resetPassword(email)
    setSubmitting(false)
    if (resetError) {
      setError(resetError.message)
      return
    }
    setMessage('Check your email for a password reset link.')
  }

  return (
    <Card className="w-full max-w-sm p-7">
      <h1 className="text-xl font-bold text-text">Reset your password</h1>
      <p className="mt-1 text-sm text-text-secondary">We&rsquo;ll email you a reset link.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
        <Input
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {error && <p className="text-sm font-medium text-danger">{error}</p>}
        {message && <p className="text-sm font-medium text-primary">{message}</p>}

        <Button type="submit" size="lg" disabled={submitting} className="w-full">
          {submitting ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-text-secondary">
        <Link to="/login" className="font-semibold text-primary">
          Back to login
        </Link>
      </p>
    </Card>
  )
}
