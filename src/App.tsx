import { useState, useEffect, useCallback, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom'
import Request from './lib/request'
import { Loading } from '@/components/ui/loading'
import AppLayout from './components/AppLayout'
import LandingPage from './app/landing/page'
import Login from './app/auth/login/page'
import Register from './app/auth/register/page'
import ForgotPassword from './app/auth/forgot-password/page'
import ResetPassword from './app/auth/reset-password/page'

// Admin and agent screens are the heaviest part of the bundle (charts, tabs) and
// most sessions never open them — load them on demand.
const Dashboard = lazy(() => import('./app/dashboard/page'))
const AgentDetail = lazy(() => import('./app/agent-detail/page'))
const Settings = lazy(() => import('./app/settings/page'))
const Admin = lazy(() => import('./app/admin/page'))

export interface SessionUser {
  id: number
  username: string
  role: string
  email: string
  plan: string
  email_verified: boolean
}

function useSession() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(!!token)

  const signOut = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    setLoading(false)
  }, [])

  const signIn = useCallback((newToken: string) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setLoading(true)
  }, [])

  useEffect(() => {
    if (!token) return
    let cancelled = false
    Request.Get('/auth/me')
      .then((data) => { if (!cancelled) setUser(data) })
      .catch(() => { if (!cancelled) setUser(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [token])

  useEffect(() => {
    const onExpired = () => signOut()
    window.addEventListener('auth:expired', onExpired)
    return () => window.removeEventListener('auth:expired', onExpired)
  }, [signOut])

  // Keep a working session alive rather than dropping the user at the hour mark.
  useEffect(() => {
    if (!token) return
    const id = setInterval(() => {
      Request.Post('/auth/refresh', {})
        .then((data) => { if (data?.access_token) { localStorage.setItem('token', data.access_token) } })
        .catch(() => { /* the 401 interceptor handles a dead session */ })
    }, 30 * 60 * 1000)
    return () => clearInterval(id)
  }, [token])

  return { token, user, loading, signIn, signOut, setUser }
}

function AuthedRoutes({ user, onSignOut, onUserChange }: {
  user: SessionUser
  onSignOut: () => void
  onUserChange: (u: SessionUser) => void
}) {
  return (
    <AppLayout user={user} onSignOut={onSignOut}>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />} />
          <Route path="/dashboard" element={<DashboardRoute />} />
          <Route path="/agents/:agentId" element={<AgentRoute onSignOut={onSignOut} />} />
          <Route path="/settings" element={<Settings onLogout={onSignOut} onUsernameChange={(name: string) => onUserChange({ ...user, username: name })} />} />
          <Route path="/admin" element={<AdminRoute tab="dashboard" onSignOut={onSignOut} isAdmin={user.role === 'admin'} />} />
          <Route path="/admin/users" element={<AdminRoute tab="users" onSignOut={onSignOut} isAdmin={user.role === 'admin'} />} />
          <Route path="/admin/agents" element={<AdminRoute tab="agents" onSignOut={onSignOut} isAdmin={user.role === 'admin'} />} />
          <Route path="/admin/logs" element={<AdminRoute tab="logs" onSignOut={onSignOut} isAdmin={user.role === 'admin'} />} />
          <Route path="/admin/integrations" element={<AdminRoute tab="integrations" onSignOut={onSignOut} isAdmin={user.role === 'admin'} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppLayout>
  )
}

function DashboardRoute() {
  const navigate = useNavigate()
  return <Dashboard onLogout={() => window.dispatchEvent(new Event('auth:expired'))} onOpenAgent={(id: number) => navigate(`/agents/${id}`)} />
}

function AgentRoute({ onSignOut }: { onSignOut: () => void }) {
  const { agentId } = useParams()
  const navigate = useNavigate()
  const id = Number(agentId)
  if (!Number.isFinite(id)) return <Navigate to="/dashboard" replace />
  return <AgentDetail agentId={id} onBack={() => navigate('/dashboard')} onLogout={onSignOut} />
}

function AdminRoute({ tab, onSignOut, isAdmin }: { tab: 'dashboard' | 'users' | 'agents' | 'logs' | 'integrations'; onSignOut: () => void; isAdmin: boolean }) {
  const navigate = useNavigate()
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return <Admin onLogout={onSignOut} activeTab={tab} onTestAgent={() => navigate('/admin')} />
}

function PublicRoutes({ onSignIn }: { onSignIn: (token: string) => void }) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Routes>
      <Route path="/" element={<LandingPage onGoToLogin={() => navigate('/login')} />} />
      <Route path="/login" element={
        <Login onLogin={onSignIn} onSwitchToRegister={() => navigate('/register')} onBackToLanding={() => navigate('/')} onForgotPassword={() => navigate('/forgot-password')} />
      } />
      <Route path="/register" element={<Register onRegister={onSignIn} onSwitchToLogin={() => navigate('/login')} />} />
      <Route path="/forgot-password" element={<ForgotPassword onBack={() => navigate('/login')} />} />
      <Route path="/reset-password" element={<ResetPassword onDone={onSignIn} onBack={() => navigate('/login')} />} />
      {/* Anything else while signed out goes to the login screen, keeping the target. */}
      <Route path="*" element={<Navigate to="/login" replace state={{ from: location.pathname }} />} />
    </Routes>
  )
}

function App() {
  const { token, user, loading, signIn, signOut, setUser } = useSession()

  if (token && loading) return <Loading />

  return (
    <BrowserRouter>
      {token && user
        ? <AuthedRoutes user={user} onSignOut={signOut} onUserChange={setUser} />
        : <PublicRoutes onSignIn={signIn} />}
    </BrowserRouter>
  )
}

export default App
