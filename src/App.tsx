import { useState, useEffect } from 'react'
import { Bot, LayoutDashboard, Settings as SettingsIcon, LogOut, Users, MessageSquare, Activity } from 'lucide-react'
import './App.css'
import Login from './app/auth/login/page'
import Register from './app/auth/register/page'
import Dashboard from './app/dashboard/page'
import AgentDetail from './app/agent-detail/page'
import Settings from './app/settings/page'
import Admin from './app/admin/page'
import Request from './lib/request'

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [authPage, setAuthPage] = useState<'login' | 'register'>('login')
  const [activePage, setActivePage] = useState<'dashboard' | 'agent-detail' | 'settings' | 'admin-dashboard' | 'admin-users' | 'admin-agents' | 'admin-logs'>('dashboard')
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null)
  const [testAgentId, setTestAgentId] = useState<number | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    if (token) {
      Request.Get('/auth/me')
        .then((data) => {
          setUsername(data.username)
          setUserRole(data.role)
          if (data.role === 'admin') setActivePage('admin-dashboard')
        })
        .catch(() => { setUsername(null); setUserRole(null) })
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
    setUserRole(null)
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
          <Bot size={26} />
          <span>AI Chatbot</span>
        </div>

        <nav className="sidebar-nav">
          {userRole === 'admin' ? (
            <>
              <button
                className={`sidebar-nav-item${activePage === 'admin-dashboard' ? ' active' : ''}`}
                onClick={() => setActivePage('admin-dashboard')}
              >
                <LayoutDashboard size={22} />
                Dashboard
              </button>
              <button
                className={`sidebar-nav-item${activePage === 'admin-users' ? ' active' : ''}`}
                onClick={() => setActivePage('admin-users')}
              >
                <Users size={22} />
                Users
              </button>
              <button
                className={`sidebar-nav-item${activePage === 'admin-agents' ? ' active' : ''}`}
                onClick={() => setActivePage('admin-agents')}
              >
                <Bot size={22} />
                Agents
              </button>
              <button
                className={`sidebar-nav-item${activePage === 'admin-logs' ? ' active' : ''}`}
                onClick={() => setActivePage('admin-logs')}
              >
                <Activity size={22} />
                Activity Logs
              </button>
            </>
          ) : (
            <>
              <button
                className={`sidebar-nav-item${activePage === 'dashboard' || activePage === 'agent-detail' ? ' active' : ''}`}
                onClick={handleBackToDashboard}
              >
                <LayoutDashboard size={22} />
                Dashboard
              </button>
              <button
                className={`sidebar-nav-item${activePage === 'settings' ? ' active' : ''}`}
                onClick={() => setActivePage('settings')}
              >
                <SettingsIcon size={22} />
                Settings
              </button>
            </>
          )}
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
            <LogOut size={22} />
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        {activePage === 'dashboard' && <Dashboard onLogout={handleLogout} onOpenAgent={handleOpenAgent} />}
        {activePage === 'agent-detail' && selectedAgentId && (
          <AgentDetail agentId={selectedAgentId} onBack={handleBackToDashboard} onLogout={handleLogout} />
        )}
        {activePage.startsWith('admin-') && (
          <Admin
            onLogout={handleLogout}
            activeTab={activePage.replace('admin-', '') as 'dashboard' | 'users' | 'agents' | 'logs'}
            testAgentId={testAgentId}
            onTestAgent={(agentId) => { setTestAgentId(agentId); setActivePage('admin-dashboard') }}
          />
        )}
        {activePage === 'settings' && <Settings onLogout={handleLogout} onUsernameChange={setUsername} />}
      </main>
    </div>
  )
}

export default App
