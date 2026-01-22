import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import type { LoginResult } from '../auth/useAuth'
import { DEMO_EMAIL, DEMO_PASSWORD } from '../auth/useAuth'

type Props = {
  onLogin: (email: string, password: string) => Promise<LoginResult>
}

function isValidEmail(value: string) {
  // Simple email check; sufficient for demo UI.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export default function LoginForm({ onLogin }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.length > 0 && !isSubmitting
  }, [email, password, isSubmitting])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const trimmedEmail = email.trim()
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
          <p className="subtitle">Simple client-side demo login (no backend)</p>
        </header>

        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="label">Email</span>
            <input
              className="input"
              autoComplete="email"
              inputMode="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="field">
            <span className="label">Password</span>
            <input
              className="input"
              type="password"
              autoComplete="current-password"
              placeholder="admin123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <div className="error">{error}</div>}

          <button className="button" type="submit" disabled={!canSubmit}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>

          <div className="hint">
            <div className="hintTitle">Demo credentials</div>
            <div className="hintRow">
              <span className="hintKey">Email:</span> <code>{DEMO_EMAIL}</code>
            </div>
            <div className="hintRow">
              <span className="hintKey">Password:</span> <code>{DEMO_PASSWORD}</code>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
