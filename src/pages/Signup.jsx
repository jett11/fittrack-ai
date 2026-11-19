import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import GoogleButton from '../components/auth/GoogleButton'
import { useAuth } from '../hooks/useAuth'

export default function Signup() {
  const { signUp, isDemoMode } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState('')

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const next = {}
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address.'
    if (form.password.length < 8) next.password = 'Password must be at least 8 characters.'
    if (form.confirm !== form.password) next.confirm = 'Passwords don’t match.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setNotice('')
    if (!validate()) return
    setSubmitting(true)
    const { error } = await signUp(form.email, form.password)
    setSubmitting(false)
    if (error) {
      setErrors({ form: error.message })
      return
    }
    if (!isDemoMode) {
      setNotice('Check your email to confirm your account, then log in.')
      return
    }
    navigate('/onboarding')
  }

  return (
    <Card className="w-full max-w-sm p-7">
      <h1 className="text-xl font-bold text-text">Create your account</h1>
      <p className="mt-1 text-sm text-text-secondary">Free to start. No credit card needed.</p>

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
          error={errors.email}
          required
        />
        <Input
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={update('password')}
          error={errors.password}
          required
        />
        <Input
          id="confirm"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={form.confirm}
          onChange={update('confirm')}
          error={errors.confirm}
          required
        />

        {errors.form && <p className="text-sm font-medium text-danger">{errors.form}</p>}
        {notice && <p className="text-sm font-medium text-primary">{notice}</p>}

        <Button type="submit" size="lg" disabled={submitting} className="mt-1 w-full">
          {submitting ? 'Creating account…' : 'Get started free'}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary">
          Log in
        </Link>
      </p>
    </Card>
  )
}
