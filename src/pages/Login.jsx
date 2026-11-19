import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import GoogleButton from '../components/auth/GoogleButton'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { error: signInError } = await signIn(form.email, form.password)
    setSubmitting(false)
    if (signInError) {
      setError(signInError.message)
      return
    }
    navigate(location.state?.from ?? '/dashboard')
  }

  return (
    <Card className="w-full max-w-sm p-7">
      <h1 className="text-xl font-bold text-text">Welcome back</h1>
      <p className="mt-1 text-sm text-text-secondary">Log in to see your dashboard.</p>

      <div className="mt-6">
        <GoogleButton />
      </div>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-text-secondary">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={update('email')}
          required
        />
        <Input
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={update('password')}
          required
        />

        {error && <p className="text-sm font-medium text-danger">{error}</p>}

        <div className="-mt-1 text-right">
          <Link to="/forgot-password" className="text-sm font-medium text-primary">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" disabled={submitting} className="w-full">
          {submitting ? 'Logging in…' : 'Log in'}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-text-secondary">
        New here?{' '}
        <Link to="/signup" className="font-semibold text-primary">
          Create a free account
        </Link>
      </p>
    </Card>
  )
}
