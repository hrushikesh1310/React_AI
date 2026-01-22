import type { AuthUser } from '../auth/useAuth'

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

export default function Dashboard({ user, onLogout }: Props) {
  return (
    <div className="page">
      <div className="card">
        <header className="cardHeader">
          <h1 className="title">Dashboard</h1>
          <p className="subtitle">You are logged in.</p>
        </header>

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

        <button className="button secondary" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  )
}

