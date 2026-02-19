import { useState, useEffect } from 'react'
import './App.css'
import Login from './app/auth/login/page'
import Register from './app/auth/register/page'
import Dashboard from './app/dashboard/page'
import Settings from './app/settings/page'
import Request from './lib/request'

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [authPage, setAuthPage] = useState<'login' | 'register'>('login')
  const [activePage, setActivePage] = useState<'dashboard' | 'settings'>('dashboard')
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    if (token) {
      Request.Get('/auth/me')
        .then((data) => setUsername(data.username))
        .catch(() => setUsername(null))
    }
  }, [token])

  const handleAuth = (newToken: string) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUsername(null)
    setAuthPage('login')
    setActivePage('dashboard')
  }

  if (!token) {
    if (authPage === 'register') {
      return <Register onRegister={handleAuth} onSwitchToLogin={() => setAuthPage('login')} />
    }
    return <Login onLogin={handleAuth} onSwitchToRegister={() => setAuthPage('register')} />
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span>🤖</span>
          <span>AI Chatbot</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`sidebar-nav-item${activePage === 'dashboard' ? ' active' : ''}`}
            onClick={() => setActivePage('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`sidebar-nav-item${activePage === 'settings' ? ' active' : ''}`}
            onClick={() => setActivePage('settings')}
          >
            ⚙️ Settings
          </button>
        </nav>

        <div className="sidebar-bottom">
          {username && (
            <div className="sidebar-user">
              <div className="sidebar-user-avatar">
                {username[0].toUpperCase()}
              </div>
              <span className="sidebar-user-email">{username}</span>
            </div>
          )}
          <button className="sidebar-logout" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        {activePage === 'dashboard' && <Dashboard onLogout={handleLogout} />}
        {activePage === 'settings' && <Settings />}
      </main>
    </div>
  )
}

export default App
