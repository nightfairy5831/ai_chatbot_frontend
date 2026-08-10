import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Bot, LayoutDashboard, Settings as SettingsIcon, LogOut, Users, Activity, Menu, X, Palette, Plug } from 'lucide-react'
import type { SessionUser } from '../App'
import { useTheme } from '../lib/useTheme'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
  end?: boolean
}

const CLIENT_NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { to: '/settings', label: 'Settings', icon: <SettingsIcon size={20} /> },
]

const ADMIN_NAV: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} />, end: true },
  { to: '/admin/users', label: 'Users', icon: <Users size={20} /> },
  { to: '/admin/agents', label: 'Agents', icon: <Bot size={20} /> },
  { to: '/admin/logs', label: 'Activity Logs', icon: <Activity size={20} /> },
  { to: '/admin/integrations', label: 'Integrations', icon: <Plug size={20} /> },
]

export default function AppLayout({ user, onSignOut, children }: {
  user: SessionUser
  onSignOut: () => void
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const nav = user.role === 'admin' ? ADMIN_NAV : CLIENT_NAV

  const themeButton = (
    <button onClick={toggleTheme} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-lg hover:bg-gray-100" title="Switch theme">
      <Palette size={15} />
      <span className={`w-2.5 h-2.5 rounded-full ${theme === 'blue' ? 'bg-[#3b82f6]' : 'bg-[#a8558f]'}`} />
    </button>
  )

  const wordmark = (size: string) => (
    <span className={`${size} font-medium tracking-tight`}>
      <span className="text-gray-800">Lead</span>
      <span className="text-[#a8558f]">Lab</span>
    </span>
  )

  return (
    <div className="min-h-screen">
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed top-0 left-0 w-64 h-screen bg-white border-r border-gray-200 flex flex-col z-50 overflow-y-auto transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          {wordmark('text-xl')}
          {themeButton}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-light text-brand-dark' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center text-sm font-semibold">
              {user.username[0].toUpperCase()}
            </div>
            <span className="text-sm text-gray-600 truncate">{user.username}</span>
          </div>
          <button onClick={onSignOut} className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-red-50">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="md:ml-64 min-h-screen bg-gray-50 text-gray-800">
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 md:hidden">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100">
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            {wordmark('text-lg')}
          </div>
          {themeButton}
        </div>

        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
