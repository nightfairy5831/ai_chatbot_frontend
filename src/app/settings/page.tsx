import { useState, useEffect } from 'react'
import { User, Lock, Activity, Save, CheckCircle, AlertCircle, CreditCard, Zap, ArrowUpRight, Crown, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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

  // Subscription state
  const [subscription, setSubscription] = useState<{
    plan: string; plan_name: string; price: number; usage: number; limit: number;
    has_subscription: boolean; status?: string; current_period_end?: number
  } | null>(null)
  const [subLoading, setSubLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  const fetchSubscription = async () => {
    try {
      const data = await Request.Get('/stripe/subscription')
      setSubscription(data)
    } catch { /* ignore */ }
  }

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
    fetchSubscription()
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

  const handleCheckout = async (plan: string) => {
    setCheckoutLoading(plan)
    try {
      const data = await Request.Post('/stripe/create-checkout-session', { plan })
      window.location.href = data.url
    } catch {
      setCheckoutLoading(null)
    }
  }

  const handleManageSubscription = async () => {
    setSubLoading(true)
    try {
      const data = await Request.Post('/stripe/create-portal-session', {})
      window.location.href = data.url
    } catch { /* ignore */ }
    finally { setSubLoading(false) }
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
          <TabsTrigger value="subscription" className="gap-1.5"><CreditCard size={14} /> Subscription</TabsTrigger>
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

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="max-w-full">
          {subscription ? (
            <div className="space-y-4">
              {/* Current Plan & Usage */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                        <Crown size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-gray-900 m-0">{subscription.plan_name}</h3>
                          {subscription.plan !== 'free' && (
                            <Badge className="bg-brand/10 text-brand border-0 text-xs">Active</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 m-0">
                          {subscription.price > 0 ? `R$ ${subscription.price}/month` : 'No charge'}
                        </p>
                      </div>
                    </div>
                    {subscription.has_subscription && (
                      <Button variant="outline" size="sm" onClick={handleManageSubscription} disabled={subLoading} className="gap-1.5">
                        <ArrowUpRight size={14} /> {subLoading ? 'Loading...' : 'Manage Subscription'}
                      </Button>
                    )}
                  </div>

                  {/* Usage Bar */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <Zap size={14} className="text-brand" /> Monthly Usage
                      </span>
                      <span className="text-sm text-gray-500">
                        <span className="font-semibold text-gray-900">{subscription.usage.toLocaleString()}</span>
                        {' / '}
                        {subscription.limit.toLocaleString()} messages
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min((subscription.usage / subscription.limit) * 100, 100)}%`,
                          backgroundColor: subscription.usage / subscription.limit > 0.9 ? '#ef4444' : subscription.usage / subscription.limit > 0.7 ? '#f59e0b' : 'var(--brand)',
                        }}
                      />
                    </div>
                    {subscription.usage / subscription.limit > 0.9 && (
                      <p className="text-xs text-red-500 mt-1.5 m-0">You're nearing your message limit. Consider upgrading your plan.</p>
                    )}
                  </div>

                  {subscription.current_period_end && (
                    <p className="text-xs text-gray-400 m-0 mt-3">
                      Next billing date: {new Date(subscription.current_period_end * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Plan Cards */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 m-0 mb-3">
                  {subscription.plan === 'free' ? 'Choose a Plan' : 'Change Plan'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {([
                    { key: 'starter', name: 'Starter', price: 'R$ 197', messages: '1,000', features: ['1 agent', 'Web chat', 'Basic reports'], recommended: false },
                    { key: 'growth', name: 'Growth', price: 'R$ 397', messages: '5,000', features: ['3 agents', 'WhatsApp integration', 'Advanced insights'], recommended: true },
                    { key: 'scale', name: 'Scale', price: 'R$ 797', messages: '20,000', features: ['Unlimited agents', 'Calendar booking', 'Priority support'], recommended: false },
                  ] as const).map((plan) => {
                    const isCurrent = subscription.plan === plan.key
                    return (
                      <Card key={plan.key} className={`relative transition-all ${isCurrent ? 'ring-2 ring-brand' : 'hover:shadow-md'}`}>
                        {plan.recommended && !isCurrent && (
                          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                            <Badge className="bg-brand text-white border-0 text-[10px] px-2.5">Recommended</Badge>
                          </div>
                        )}
                        <CardContent className="p-4">
                          <div className="mb-3">
                            <h4 className="text-sm font-bold text-gray-900 m-0">{plan.name}</h4>
                            <div className="flex items-baseline gap-1 mt-1">
                              <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                              <span className="text-xs text-gray-400">/month</span>
                            </div>
                            <p className="text-xs text-gray-500 m-0 mt-1">{plan.messages} messages/month</p>
                          </div>
                          <ul className="list-none m-0 p-0 space-y-1.5 mb-4">
                            {plan.features.map((f) => (
                              <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                                <Check size={12} className="text-brand shrink-0" /> {f}
                              </li>
                            ))}
                          </ul>
                          {isCurrent ? (
                            <Button size="sm" disabled className="w-full gap-1.5 opacity-60">
                              Current Plan
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="w-full gap-1.5"
                              variant={subscription.has_subscription ? 'outline' : 'default'}
                              onClick={() => subscription.has_subscription ? handleManageSubscription() : handleCheckout(plan.key)}
                              disabled={checkoutLoading === plan.key}
                            >
                              {checkoutLoading === plan.key ? 'Loading...' : subscription.has_subscription ? 'Switch Plan' : 'Subscribe'}
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <Loading text="Loading subscription..." />
          )}
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
