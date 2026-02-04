import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import type { LoginResult } from '../auth/useAuth'

type Props = {
  onLogin: (email: string, password: string) => Promise<LoginResult>
}

function isValidEmail(value: string) {
  // Simple email check; sufficient for demo UI.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export default function LoginForm({ onLogin }: Props) {
  const [email, setEmail] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const trimmedEmail = useMemo(() => email.trim(), [email])

  const emailError = useMemo(() => {
    if (!emailTouched) return null
    if (!trimmedEmail) return 'Email is required.'
    if (!isValidEmail(trimmedEmail)) return 'Please enter a valid email address.'
    return null
  }, [emailTouched, trimmedEmail])

  const canSubmit = useMemo(() => {
    return Boolean(trimmedEmail) && isValidEmail(trimmedEmail) && password.length > 0 && !isSubmitting
  }, [trimmedEmail, password, isSubmitting])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setEmailTouched(true)

    if (!trimmedEmail) return setError('Email is required.')
    if (!isValidEmail(trimmedEmail)) return setError('Please enter a valid email address.')
    if (!password) return setError('Password is required.')

    setIsSubmitting(true)
    try {
      const result = await onLogin(trimmedEmail, password)
      if (!result.ok) setError(result.error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="card">
        <header className="cardHeader">
          <h1 className="title">Sign in</h1>
          <p className="subtitle">Sign in via API (credentials validated server-side)</p>
        </header>

        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="label">Email</span>
            <input
              className="input"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              required
              aria-invalid={emailError ? 'true' : 'false'}
              aria-describedby={emailError ? 'email-error' : undefined}
            />
          </label>

          {emailError && (
            <div className="error" id="email-error">
              {emailError}
            </div>
          )}

          <label className="field">
            <span className="label">Password</span>
            <input
              className="input"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <div className="error">{error}</div>}

          <button className="button" type="submit" disabled={!canSubmit}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
