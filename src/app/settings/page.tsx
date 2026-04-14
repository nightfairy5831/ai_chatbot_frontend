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
    return (
      <div className="flex items-center justify-center gap-2.5 py-12 text-gray-400 text-sm">
        <div className="w-5 h-5 border-[2.5px] border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        Loading...
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="m-0 text-2xl font-bold text-gray-900 tracking-tight">Settings</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 mb-6">
        <button
          className={`px-5 py-3 cursor-pointer text-base font-medium border-b-2 transition-colors bg-transparent outline-none ${
            activeTab === 'profile'
              ? 'text-blue-500 border-b-blue-500 font-semibold'
              : 'text-gray-500 border-b-transparent hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={`px-5 py-3 cursor-pointer text-base font-medium border-b-2 transition-colors bg-transparent outline-none ${
            activeTab === 'api'
              ? 'text-blue-500 border-b-blue-500 font-semibold'
              : 'text-gray-500 border-b-transparent hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('api')}
        >
          API Test
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="max-w-full overflow-y-auto max-h-[calc(100vh-5rem)]">
          {/* Profile Form */}
          <form className="bg-white border border-gray-200 rounded-xl p-5 mb-4" onSubmit={handleProfileSave}>
            <h3 className="flex items-center gap-2.5 m-0 mb-4 text-xl font-bold text-gray-900 tracking-tight">
              <User size={22} className="text-blue-500" /> Profile
            </h3>
            <div className="mb-3">
              <label className="block text-[0.95rem] font-semibold text-gray-700 mb-1.5 tracking-wide">Username</label>
              <input
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-base text-gray-800 bg-white outline-none transition-colors focus:border-blue-500"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
              />
            </div>
            <div className="mb-3">
              <label className="block text-[0.95rem] font-semibold text-gray-700 mb-1.5 tracking-wide">Email</label>
              <input
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-base text-gray-800 bg-white outline-none transition-colors focus:border-blue-500"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            {profileMsg && (
              <p className={`text-sm m-0 mb-2 ${profileMsg.isError ? 'text-red-600' : 'text-green-600'}`}>
                {profileMsg.text}
              </p>
            )}
            <div className="flex gap-3 mt-3">
              <button
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg border-none bg-blue-500 text-white text-[0.95rem] font-semibold cursor-pointer transition-colors hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
                type="submit"
                disabled={profileSaving}
              >
                <Save size={18} /> {profileSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>

          {/* Change Password Form */}
          <form className="bg-white border border-gray-200 rounded-xl p-5 mb-4" onSubmit={handlePasswordChange}>
            <h3 className="flex items-center gap-2.5 m-0 mb-4 text-xl font-bold text-gray-900 tracking-tight">
              <Lock size={22} className="text-blue-500" /> Change Password
            </h3>
            <div className="mb-3">
              <label className="block text-[0.95rem] font-semibold text-gray-700 mb-1.5 tracking-wide">Current Password</label>
              <input
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-base text-gray-800 bg-white outline-none transition-colors focus:border-blue-500"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />
            </div>
            <div className="mb-3">
              <label className="block text-[0.95rem] font-semibold text-gray-700 mb-1.5 tracking-wide">New Password</label>
              <input
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-base text-gray-800 bg-white outline-none transition-colors focus:border-blue-500"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
            </div>
            <div className="mb-3">
              <label className="block text-[0.95rem] font-semibold text-gray-700 mb-1.5 tracking-wide">Confirm New Password</label>
              <input
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-base text-gray-800 bg-white outline-none transition-colors focus:border-blue-500"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>
            {passwordMsg && (
              <p className={`text-sm m-0 mb-2 ${passwordMsg.isError ? 'text-red-600' : 'text-green-600'}`}>
                {passwordMsg.text}
              </p>
            )}
            <div className="flex gap-3 mt-3">
              <button
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg border-none bg-blue-500 text-white text-[0.95rem] font-semibold cursor-pointer transition-colors hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
                type="submit"
                disabled={passwordSaving}
              >
                <Lock size={18} /> {passwordSaving ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* API Test Tab */}
      {activeTab === 'api' && (
        <div className="max-w-full overflow-y-auto max-h-[calc(100vh-5rem)]">
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
            <h3 className="flex items-center gap-2.5 m-0 mb-4 text-xl font-bold text-gray-900 tracking-tight">
              <Activity size={22} className="text-blue-500" /> API Health Check
            </h3>
            <div className="flex gap-3">
              <button
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg border-none bg-blue-500 text-white text-[0.95rem] font-semibold cursor-pointer transition-colors hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
                type="button"
                onClick={handleHealthCheck}
                disabled={healthLoading}
              >
                <Activity size={18} /> {healthLoading ? 'Checking...' : 'Run Health Check'}
              </button>
            </div>

            {healthLoading && (
              <div className="flex items-center justify-center gap-2.5 py-6 text-gray-400 text-sm">
                <div className="w-5 h-5 border-[2.5px] border-gray-200 border-t-blue-500 rounded-full animate-spin" />
                Checking API status...
              </div>
            )}

            {healthError && (
              <div className="flex items-center gap-2 mt-4 p-3 rounded-lg text-base bg-red-50 border border-red-200 text-red-600">
                <AlertCircle size={16} /> {healthError}
              </div>
            )}

            {healthResponse && (
              <div className="flex items-center gap-2 mt-4 p-3 rounded-lg text-base bg-green-50 border border-green-200 text-green-600">
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
