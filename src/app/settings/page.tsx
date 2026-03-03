import { useState, useEffect } from 'react'
import { User, Lock, Activity, Save, CheckCircle, AlertCircle } from 'lucide-react'
import Request from '../../lib/request'

interface SettingsProps {
  onLogout: () => void
  onUsernameChange: (name: string) => void
}

function Settings({ onLogout, onUsernameChange }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'api'>('profile')

  // Profile state
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ text: string; isError: boolean } | null>(null)

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; isError: boolean } | null>(null)

  // Health check state
  const [healthResponse, setHealthResponse] = useState<any>(null)
  const [healthLoading, setHealthLoading] = useState(false)
  const [healthError, setHealthError] = useState<string | null>(null)

  useEffect(() => {
    Request.Get('/auth/me')
      .then((data) => {
        setUsername(data.username)
        setEmail(data.email)
      })
      .catch((err) => {
        if (err.response?.status === 401) onLogout()
      })
      .finally(() => setProfileLoading(false))
  }, [])

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) {
      setProfileMsg({ text: 'Username is required', isError: true })
      return
    }
    setProfileSaving(true)
    setProfileMsg(null)
    try {
      const data = await Request.Patch('/auth/profile', {
        username: username.trim(),
        email: email.trim(),
      })
      setUsername(data.username)
      setEmail(data.email)
      onUsernameChange(data.username)
      setProfileMsg({ text: 'Profile updated successfully!', isError: false })
      setTimeout(() => setProfileMsg(null), 3000)
    } catch (err: any) {
      setProfileMsg({
        text: err.response?.data?.detail || 'Failed to update profile',
        isError: true,
      })
    } finally {
      setProfileSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match', isError: true })
      return
    }
    setPasswordSaving(true)
    setPasswordMsg(null)
    try {
      await Request.Post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordMsg({ text: 'Password changed successfully!', isError: false })
      setTimeout(() => setPasswordMsg(null), 3000)
    } catch (err: any) {
      const detail = err.response?.data?.detail
      const message = Array.isArray(detail)
        ? detail[0]?.msg || 'Validation error'
        : detail || 'Failed to change password'
      setPasswordMsg({ text: message, isError: true })
    } finally {
      setPasswordSaving(false)
    }
  }

  const handleHealthCheck = async () => {
    setHealthLoading(true)
    setHealthError(null)
    setHealthResponse(null)
    try {
      const data = await Request.Get('/health')
      setHealthResponse(data)
    } catch (err: any) {
      setHealthError(err.message || 'Request failed')
    } finally {
      setHealthLoading(false)
    }
  }

  if (profileLoading) {
    return <div className="loading-state"><div className="spinner" />Loading...</div>
  }

  return (
    <div>
      <div className="dashboard-header">
        <h2>Settings</h2>
      </div>

      <div className="tabs">
        <button className={`tab${activeTab === 'profile' ? ' active' : ''}`} onClick={() => setActiveTab('profile')}>Profile</button>
        <button className={`tab${activeTab === 'api' ? ' active' : ''}`} onClick={() => setActiveTab('api')}>API Test</button>
      </div>

      {activeTab === 'profile' && (
        <div className="tab-content">
          <form className="agent-form" onSubmit={handleProfileSave}>
            <h3 className="settings-section-title"><User size={22} /> Profile</h3>
            <div className="form-group">
              <label>Username</label>
              <input className="form-input" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your username" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
            </div>
            {profileMsg && (
              <p style={{ color: profileMsg.isError ? '#dc2626' : '#16a34a', fontSize: '0.85rem', margin: '0 0 0.5rem' }}>
                {profileMsg.text}
              </p>
            )}
            <div className="form-actions">
              <button className="btn-primary" type="submit" disabled={profileSaving}>
                <Save size={18} /> {profileSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>

          <form className="agent-form" onSubmit={handlePasswordChange}>
            <h3 className="settings-section-title"><Lock size={22} /> Change Password</h3>
            <div className="form-group">
              <label>Current Password</label>
              <input className="form-input" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" required />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input className="form-input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" required />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input className="form-input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" required />
            </div>
            {passwordMsg && (
              <p style={{ color: passwordMsg.isError ? '#dc2626' : '#16a34a', fontSize: '0.85rem', margin: '0 0 0.5rem' }}>
                {passwordMsg.text}
              </p>
            )}
            <div className="form-actions">
              <button className="btn-primary" type="submit" disabled={passwordSaving}>
                <Lock size={18} /> {passwordSaving ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'api' && (
        <div className="tab-content">
          <div className="agent-form">
            <h3 className="settings-section-title"><Activity size={22} /> API Health Check</h3>
            <div className="form-actions" style={{ marginTop: 0 }}>
              <button className="btn-primary" type="button" onClick={handleHealthCheck} disabled={healthLoading}>
                <Activity size={18} /> {healthLoading ? 'Checking...' : 'Run Health Check'}
              </button>
            </div>

            {healthLoading && (
              <div className="loading-state" style={{ padding: '1.5rem 1rem' }}>
                <div className="spinner" />Checking API status...
              </div>
            )}

            {healthError && (
              <div className="health-result health-error">
                <AlertCircle size={16} /> {healthError}
              </div>
            )}

            {healthResponse && (
              <div className="health-result health-success">
                <CheckCircle size={16} /> API is healthy: {JSON.stringify(healthResponse)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
