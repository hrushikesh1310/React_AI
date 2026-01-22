import Dashboard from './components/Dashboard'
import LoginForm from './components/LoginForm'
import { useAuth } from './auth/useAuth'

function App() {
  const { user, isAuthenticated, login, logout } = useAuth()

  if (!isAuthenticated || !user) {
    return <LoginForm onLogin={login} />
  }

  return <Dashboard user={user} onLogout={logout} />
}

export default App
