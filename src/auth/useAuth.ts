import { useCallback, useEffect, useMemo, useState } from 'react'

export type AuthUser = {
  email: string
  loggedInAt: string
}

const STORAGE_KEY = 'react-ai:authUser'

const TOKEN_KEY = 'react-ai:authToken'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:3001'

function apiUrl(path: string) {
  const base = API_BASE_URL.replace(/\/$/, '')
  if (!path.startsWith('/')) path = `/${path}`
  return `${base}${path}`
}

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

function readStoredToken(): string | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY)
    return raw || null
  } catch {
    return null
  }
}

function writeStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

function clearStoredUser() {
  localStorage.removeItem(STORAGE_KEY)
}

function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export type LoginResult = { ok: true } | { ok: false; error: string }

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser())
  const [token, setToken] = useState<string | null>(() => readStoredToken())
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function check() {
      // No token means no authenticated session.
      if (!token) {
        setIsChecking(false)
        return
      }

      try {
        const res = await fetch(apiUrl('/api/auth/me'), {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('unauthorized')
        const data = (await res.json()) as { user: AuthUser }
        if (cancelled) return
        writeStoredUser(data.user)
        setUser(data.user)
      } catch {
        if (cancelled) return
        clearStoredToken()
        clearStoredUser()
        setToken(null)
        setUser(null)
      } finally {
        if (!cancelled) setIsChecking(false)
      }
    }

    void check()
    return () => {
      cancelled = true
    }
  }, [token])

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    const normalizedEmail = email.trim().toLowerCase()

    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password }),
      })

      const data = (await res.json().catch(() => ({}))) as any
      if (!res.ok) {
        return { ok: false, error: String(data?.error || 'Login failed') }
      }

      const nextToken = String(data?.token || '')
      const nextUser = data?.user as AuthUser | undefined

      if (!nextToken || !nextUser?.email || !nextUser?.loggedInAt) {
        return { ok: false, error: 'Unexpected server response.' }
      }

      writeStoredToken(nextToken)
      writeStoredUser(nextUser)
      setToken(nextToken)
      setUser(nextUser)
      return { ok: true }
    } catch {
      return { ok: false, error: 'Network error. Is the API running?' }
    }
  }, [])

  const logout = useCallback(() => {
    clearStoredUser()
    clearStoredToken()
    setToken(null)
    setUser(null)
  }, [])

  const isAuthenticated = useMemo(() => Boolean(user), [user])

  return { user, isAuthenticated, isChecking, login, logout }
}


