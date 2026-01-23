import type { AuthUser } from '../auth/useAuth'
import type { ReactNode } from 'react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'

type Props = {
  user: AuthUser
  onLogout: () => void
}

function formatLoggedInAt(iso: string) {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

type BillingRow = {
  provider: 'Anthropic' | 'Gemini' | 'OpenText'
  currentMonthRequests: number
  currentMonthCostUsd: number
  totalCostUsd: number
  lastUsedIso: string
}

function formatCurrencyUsd(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

type ModalProps = {
  title: string
  onClose: () => void
  children: ReactNode
}

function Modal({ title, onClose, children }: ModalProps) {
  const titleId = useId()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="modalHeader">
          <h2 className="modalTitle" id={titleId}>
            {title}
          </h2>
          <button className="iconButton" type="button" aria-label="Close" onClick={onClose}>
            ✕
          </button>
        </header>
        <div className="modalBody">{children}</div>
      </div>
    </div>
  )
}

type SettingsPanelProps = {
  open: boolean
  onClose: () => void
}

function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="backdrop" role="presentation" onMouseDown={onClose}>
      <aside
        className="settingsPanel"
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="settingsHeader">
          <div>
            <div className="settingsTitle">Settings</div>
            <div className="settingsSubtitle">Demo settings panel (client-side only)</div>
          </div>
          <button className="iconButton" type="button" aria-label="Close settings" onClick={onClose}>
            ✕
          </button>
        </header>

        <div className="settingsBody">
          <div className="settingsRow">
            <div>
              <div className="settingsKey">Theme</div>
              <div className="settingsHint">Switch between light/dark (visual only)</div>
            </div>
            <select
              className="select"
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
              aria-label="Theme"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="settingsRow">
            <div>
              <div className="settingsKey">Notifications</div>
              <div className="settingsHint">Enable/disable notifications (demo)</div>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
              />
              <span className="switchTrack" aria-hidden="true" />
            </label>
          </div>

          <div className="hint">
            <div className="hintTitle">Note</div>
            <div className="hintRow">
              <span className="hintKey">Theme</span>
              <span>{theme}</span>
            </div>
            <div className="hintRow">
              <span className="hintKey">Alerts</span>
              <span>{notificationsEnabled ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default function Dashboard({ user, onLogout }: Props) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [helpModalOpen, setHelpModalOpen] = useState(false)

  const profileMenuRef = useRef<HTMLDivElement | null>(null)

  const initials = useMemo(() => {
    const first = user.email?.[0]?.toUpperCase() ?? 'U'
    return first
  }, [user.email])

  const username = useMemo(() => {
    const raw = user.email?.split('@')?.[0]?.trim()
    return raw || 'User'
  }, [user.email])

  const billingRows = useMemo<BillingRow[]>(() => {
    // Mock/demo numbers for UI.
    const now = Date.now()
    return [
      {
        provider: 'Anthropic',
        currentMonthRequests: 1842,
        currentMonthCostUsd: 27.13,
        totalCostUsd: 214.92,
        lastUsedIso: new Date(now - 35 * 60 * 1000).toISOString(),
      },
      {
        provider: 'Gemini',
        currentMonthRequests: 963,
        currentMonthCostUsd: 11.47,
        totalCostUsd: 98.31,
        lastUsedIso: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        provider: 'OpenText',
        currentMonthRequests: 221,
        currentMonthCostUsd: 6.02,
        totalCostUsd: 41.8,
        lastUsedIso: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]
  }, [])

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!profileMenuOpen) return
      const target = e.target as Node
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setProfileMenuOpen(false)
      }
    }
    window.addEventListener('mousedown', onPointerDown)
    return () => window.removeEventListener('mousedown', onPointerDown)
  }, [profileMenuOpen])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setProfileMenuOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  function openAccountSettings() {
    setProfileMenuOpen(false)
    setSettingsOpen(true)
  }

  return (
    <div className="dashboardPage">
      <header className="topbar">
        <div className="topbarLeft">
          <h1 className="topbarTitle">Welcome, {username}!</h1>
        </div>

        <div className="topbarRight">
          <button
            className="iconButton"
            type="button"
            aria-label="Open settings"
            onClick={() => setSettingsOpen(true)}
          >
            ⚙️
          </button>

          <div className="profileMenu" ref={profileMenuRef}>
            <button
              className="avatarButton"
              type="button"
              aria-label="Open profile menu"
              aria-haspopup="menu"
              aria-expanded={profileMenuOpen ? 'true' : 'false'}
              onClick={() => setProfileMenuOpen((v) => !v)}
            >
              <span className="avatarCircle" aria-hidden="true">
                {initials}
              </span>
            </button>

            {profileMenuOpen && (
              <div className="menu" role="menu" aria-label="Profile">
                <button
                  className="menuItem"
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setProfileMenuOpen(false)
                    setProfileModalOpen(true)
                  }}
                >
                  View Profile
                </button>
                <button
                  className="menuItem"
                  type="button"
                  role="menuitem"
                  onClick={openAccountSettings}
                >
                  Account Settings
                </button>
                <button
                  className="menuItem"
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setProfileMenuOpen(false)
                    setHelpModalOpen(true)
                  }}
                >
                  Help
                </button>
                <div className="menuDivider" role="separator" />
                <button
                  className="menuItem danger"
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setProfileMenuOpen(false)
                    onLogout()
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="dashboardMain">
        <section className="billingPanel" aria-label="Billing overview">
          <header className="billingHeader">
            <div>
              <h2 className="billingTitle">Billing Overview</h2>
              <p className="billingSubtitle">Usage and spend for {user.email}</p>
            </div>
            <button className="button secondary" type="button" onClick={() => setProfileModalOpen(true)}>
              View Profile
            </button>
          </header>

          <div className="tableScroll" role="region" aria-label="Billing table" tabIndex={0}>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Provider</th>
                  <th scope="col">Current Month Requests</th>
                  <th scope="col">Current Month Cost (USD)</th>
                  <th scope="col">Total Cost (USD)</th>
                  <th scope="col">Last Used</th>
                </tr>
              </thead>
              <tbody>
                {billingRows.map((row) => (
                  <tr key={row.provider}>
                    <td className="tableStrong">{row.provider}</td>
                    <td>{row.currentMonthRequests.toLocaleString()}</td>
                    <td>{formatCurrencyUsd(row.currentMonthCostUsd)}</td>
                    <td>{formatCurrencyUsd(row.totalCostUsd)}</td>
                    <td>{formatDate(row.lastUsedIso)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="billingNote">
            These numbers are mock/demo values. Billing aggregation can be wired to your backend later.
          </p>
        </section>
      </main>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {profileModalOpen && (
        <Modal title="Your Profile" onClose={() => setProfileModalOpen(false)}>
          <div className="kv">
            <div className="kvRow">
              <div className="kvKey">Email</div>
              <div className="kvVal">{user.email}</div>
            </div>
            <div className="kvRow">
              <div className="kvKey">Logged in at</div>
              <div className="kvVal">{formatLoggedInAt(user.loggedInAt)}</div>
            </div>
          </div>
        </Modal>
      )}

      {helpModalOpen && (
        <Modal title="Help" onClose={() => setHelpModalOpen(false)}>
          <p className="modalText">
            This is a demo dashboard landing page. Use the profile menu (top right) to view your profile,
            open account settings, get help, or log out.
          </p>
          <p className="modalText">
            Demo credentials: <code>admin@example.com</code> / <code>admin123</code>
          </p>
        </Modal>
      )}
    </div>
  )
}
