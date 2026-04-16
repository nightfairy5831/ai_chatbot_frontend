import { useState, useEffect } from 'react'
import { Bot, LayoutDashboard, Settings as SettingsIcon, LogOut, Users, Activity, Menu, X } from 'lucide-react'
import LandingPage from './app/landing/page'
import Login from './app/auth/login/page'
import Register from './app/auth/register/page'
import Dashboard from './app/dashboard/page'
import AgentDetail from './app/agent-detail/page'
import Settings from './app/settings/page'
import Admin from './app/admin/page'
import Request from './lib/request'

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [showLanding, setShowLanding] = useState(true)
  const [authPage, setAuthPage] = useState<'login' | 'register'>('login')
  const [activePage, setActivePage] = useState<'dashboard' | 'agent-detail' | 'settings' | 'admin-dashboard' | 'admin-users' | 'admin-agents' | 'admin-logs'>('dashboard')
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null)
  const [testAgentId, setTestAgentId] = useState<number | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
    setShowLanding(true)
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
    if (showLanding) return <LandingPage onGoToLogin={() => setShowLanding(false)} />
    if (authPage === 'register') return <Register onRegister={handleAuth} onSwitchToLogin={() => setAuthPage('login')} />
    return <Login onLogin={handleAuth} onSwitchToRegister={() => setAuthPage('register')} onBackToLanding={() => setShowLanding(true)} />
  }

  return (
    <div className="min-h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 w-64 h-screen bg-white border-r border-gray-200 flex flex-col z-50 overflow-y-auto transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
          <span className="text-xl font-medium tracking-tight">
            <span className="text-gray-800">Lead</span>
            <span className="text-[#a8558f]">Lab</span>
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {userRole === 'admin' ? (
            <>
              <NavItem active={activePage === 'admin-dashboard'} icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={() => { setActivePage('admin-dashboard'); setSidebarOpen(false) }} />
              <NavItem active={activePage === 'admin-users'} icon={<Users size={20} />} label="Users" onClick={() => { setActivePage('admin-users'); setSidebarOpen(false) }} />
              <NavItem active={activePage === 'admin-agents'} icon={<Bot size={20} />} label="Agents" onClick={() => { setActivePage('admin-agents'); setSidebarOpen(false) }} />
              <NavItem active={activePage === 'admin-logs'} icon={<Activity size={20} />} label="Activity Logs" onClick={() => { setActivePage('admin-logs'); setSidebarOpen(false) }} />
            </>
          ) : (
            <>
              <NavItem active={activePage === 'dashboard' || activePage === 'agent-detail'} icon={<LayoutDashboard size={20} />} label="Dashboard" onClick={() => { handleBackToDashboard(); setSidebarOpen(false) }} />
              <NavItem active={activePage === 'settings'} icon={<SettingsIcon size={20} />} label="Settings" onClick={() => { setActivePage('settings'); setSidebarOpen(false) }} />
            </>
          )}
        </nav>

        <div className="px-4 py-4 border-t border-gray-100">
          {username && (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
                {username[0].toUpperCase()}
              </div>
              <span className="text-sm text-gray-600 truncate">{username}</span>
            </div>
          )}
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-red-50">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="md:ml-64 min-h-screen bg-gray-50 text-gray-800">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-gray-50 md:hidden">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100">
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <span className="text-lg font-medium tracking-tight">
            <span className="text-gray-800">Lead</span>
            <span className="text-[#a8558f]">Lab</span>
          </span>
        </div>

        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
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
        </div>
      </main>
    </div>
  )
}

function NavItem({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}`}
    >
      {icon}
      {label}
    </button>
  )
}

export default App
