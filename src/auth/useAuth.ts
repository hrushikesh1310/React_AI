import { useCallback, useMemo, useState } from 'react'

export type AuthUser = {
  email: string
  loggedInAt: string
}

const STORAGE_KEY = 'react-ai:authUser'

export const DEMO_EMAIL = 'admin@example.com'
export const DEMO_PASSWORD = 'admin123'

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AuthUser
    if (!parsed?.email || !parsed?.loggedInAt) return null
    return parsed
  } catch {
    return null
  }
}

function writeStoredUser(user: AuthUser) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

function clearStoredUser() {
  localStorage.removeItem(STORAGE_KEY)
}

export type LoginResult = { ok: true } | { ok: false; error: string }

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser())

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    const normalizedEmail = email.trim().toLowerCase()

    if (normalizedEmail === DEMO_EMAIL && password === DEMO_PASSWORD) {
      const nextUser: AuthUser = {
        email: normalizedEmail,
        loggedInAt: new Date().toISOString(),
      }
      writeStoredUser(nextUser)
      setUser(nextUser)
      return { ok: true }
    }

    return { ok: false, error: 'Invalid email or password.' }
  }, [])

  const logout = useCallback(() => {
    clearStoredUser()
    setUser(null)
  }, [])

  const isAuthenticated = useMemo(() => Boolean(user), [user])

  return { user, isAuthenticated, login, logout }
}

