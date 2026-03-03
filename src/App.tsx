import { useState, useEffect } from 'react'
import { Bot, LayoutDashboard, Settings as SettingsIcon, LogOut } from 'lucide-react'
import './App.css'
import Login from './app/auth/login/page'
import Register from './app/auth/register/page'
import Dashboard from './app/dashboard/page'
import AgentDetail from './app/agent-detail/page'
import Settings from './app/settings/page'
import Request from './lib/request'

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [authPage, setAuthPage] = useState<'login' | 'register'>('login')
  const [activePage, setActivePage] = useState<'dashboard' | 'agent-detail' | 'settings'>('dashboard')
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null)
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
    setSelectedAgentId(null)
  }

  const handleOpenAgent = (agentId: number) => {
    setSelectedAgentId(agentId)
    setActivePage('agent-detail')
  }

  const handleBackToDashboard = () => {
    setSelectedAgentId(null)
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
          <Bot size={22} />
          <span>AI Chatbot</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`sidebar-nav-item${activePage === 'dashboard' || activePage === 'agent-detail' ? ' active' : ''}`}
            onClick={handleBackToDashboard}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button
            className={`sidebar-nav-item${activePage === 'settings' ? ' active' : ''}`}
            onClick={() => setActivePage('settings')}
          >
            <SettingsIcon size={20} />
            Settings
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
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        {activePage === 'dashboard' && <Dashboard onLogout={handleLogout} onOpenAgent={handleOpenAgent} />}
        {activePage === 'agent-detail' && selectedAgentId && (
          <AgentDetail agentId={selectedAgentId} onBack={handleBackToDashboard} onLogout={handleLogout} />
        )}
        {activePage === 'settings' && <Settings onLogout={handleLogout} onUsernameChange={setUsername} />}
      </main>
    </div>
  )
}

export default App
