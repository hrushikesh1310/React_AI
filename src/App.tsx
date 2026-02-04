import Dashboard from './components/Dashboard'
import LoginForm from './components/LoginForm'
import { useAuth } from './auth/useAuth'

function App() {
  const { user, isAuthenticated, isChecking, login, logout } = useAuth()

  if (isChecking) {
    return (
      <div className="page">
        <div className="card">
          <h1 className="title">Loading…</h1>
          <p className="subtitle">Checking session</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <LoginForm onLogin={login} />
  }

  return <Dashboard user={user} onLogout={logout} />
}

export default App
