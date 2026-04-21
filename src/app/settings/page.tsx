import { useState, useEffect } from 'react'
import { User, Lock, Activity, Save, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Loading } from '@/components/ui/loading'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import Request from '../../lib/request'

interface SettingsProps {
  onLogout: () => void
  onUsernameChange: (name: string) => void
}

function Settings({ onLogout, onUsernameChange }: SettingsProps) {
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
    return <Loading />
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="m-0 text-xl font-bold text-gray-900">Settings</h2>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="api">API Test</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="max-w-full space-y-3">
          <Card>
            <CardContent className="p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 m-0 mb-3">
                <User size={16} className="text-brand" /> Profile
              </h3>
              <form onSubmit={handleProfileSave}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <Label htmlFor="username" className="block text-xs font-medium text-gray-500 mb-1">Username</Label>
                    <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your username" />
                  </div>
                  <div>
                    <Label htmlFor="email" className="block text-xs font-medium text-gray-500 mb-1">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
                  </div>
                </div>
                {profileMsg && (
                  <p className={`text-xs m-0 mb-2 ${profileMsg.isError ? 'text-red-600' : 'text-green-600'}`}>{profileMsg.text}</p>
                )}
                <Button type="submit" size="sm" disabled={profileSaving} className="gap-1.5">
                  <Save size={14} /> {profileSaving ? 'Saving...' : 'Save'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 m-0 mb-3">
                <Lock size={16} className="text-brand" /> Change Password
              </h3>
              <form onSubmit={handlePasswordChange}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div>
                    <Label htmlFor="current-password" className="block text-xs font-medium text-gray-500 mb-1">Current Password</Label>
                    <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" required />
                  </div>
                  <div>
                    <Label htmlFor="new-password" className="block text-xs font-medium text-gray-500 mb-1">New Password</Label>
                    <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" required />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password" className="block text-xs font-medium text-gray-500 mb-1">Confirm</Label>
                    <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" required />
                  </div>
                </div>
                {passwordMsg && (
                  <p className={`text-xs m-0 mb-2 ${passwordMsg.isError ? 'text-red-600' : 'text-green-600'}`}>{passwordMsg.text}</p>
                )}
                <Button type="submit" size="sm" disabled={passwordSaving} className="gap-1.5">
                  <Lock size={14} /> {passwordSaving ? 'Changing...' : 'Change Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Test Tab */}
        <TabsContent value="api" className="max-w-full">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Activity size={22} className="text-primary" /> API Health Check
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={handleHealthCheck}
                  disabled={healthLoading}
                  className="gap-1.5"
                >
                  <Activity size={18} /> {healthLoading ? 'Checking...' : 'Run Health Check'}
                </Button>
              </div>

              {healthLoading && (
                <div className="flex items-center justify-center gap-2.5 py-4 text-muted-foreground text-sm">
                  <div className="w-4 h-4 border-2 border-gray-200 border-t-brand rounded-full animate-spin" />
                  Checking API status...
                </div>
              )}

              {healthError && (
                <div className="flex items-center gap-2 p-3 rounded-lg text-base bg-destructive/10 border border-destructive/20 text-destructive">
                  <AlertCircle size={16} /> {healthError}
                </div>
              )}

              {healthResponse && (
                <div className="flex items-center gap-2 p-3 rounded-lg text-base bg-green-50 border border-green-200 text-green-600">
                  <CheckCircle size={16} /> API is healthy: {JSON.stringify(healthResponse)}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Settings
