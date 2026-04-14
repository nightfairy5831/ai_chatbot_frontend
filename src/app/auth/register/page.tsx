import { useState } from 'react'
import Request from '../../../lib/request'

function Register({ onRegister, onSwitchToLogin }: { onRegister: (token: string) => void; onSwitchToLogin: () => void }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const validate = (): string | null => {
    if (!agreed) return 'Please accept the Privacy Policy and Terms of Use'
    const trimmed = username.trim()
    if (trimmed.length < 3) return 'Username must be at least 3 characters'
    if (trimmed.length > 30) return 'Username must be at most 30 characters'
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) return 'Username can only contain letters, numbers, underscores, and hyphens'
    if (password.length < 8) return 'Password must be at least 8 characters'
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter'
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter'
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await Request.Post('/auth/register', { username: username.trim(), email, password })
      onRegister(data.access_token)
    } catch (err: any) {
      const detail = err.response?.data?.detail
      if (typeof detail === 'string') {
        setError(detail)
      } else if (Array.isArray(detail)) {
        setError(detail[0]?.msg?.replace('Value error, ', '') || 'Registration failed')
      } else {
        setError('Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-[#fafafa] overflow-y-auto box-border py-4">
      <div className="w-full max-w-[440px] px-6">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-2xl font-bold text-[#1a1a2e] tracking-tight">
            <span className="text-3xl">🤖</span>
            <span>AI Chatbot</span>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="m-0 text-4xl font-extrabold text-gray-900 leading-tight">
            Sign Up
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Build Amazing <span className="text-[#4f6ef7]">AI Agent</span><span className="text-purple-500">s</span>
          </p>
        </div>

        {/* Google Sign Up */}
        <button
          type="button"
          className="w-full py-3.5 rounded-3xl border border-gray-200 bg-white text-[0.95rem] font-medium cursor-pointer flex items-center justify-center gap-3 text-gray-700 transition-colors duration-200 hover:bg-gray-50"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign Up With Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm">Or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              className="w-full py-3.5 px-4 rounded-3xl border border-gray-200 text-[0.95rem] outline-none box-border text-gray-800 bg-white transition-colors duration-200 focus:border-[#4f6ef7]"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <input
              className="w-full py-3.5 px-4 rounded-3xl border border-gray-200 text-[0.95rem] outline-none box-border text-gray-800 bg-white transition-colors duration-200 focus:border-[#4f6ef7]"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6 relative">
            <input
              className="w-full py-3.5 px-4 pr-12 rounded-3xl border border-gray-200 text-[0.95rem] outline-none box-border text-gray-800 bg-white transition-colors duration-200 focus:border-[#4f6ef7]"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              className="appearance-none bg-transparent border-none absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer flex items-center p-0 outline-none focus:outline-none"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              )}
            </button>
          </div>

          {error && (
            <div className="mb-4 py-3 px-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-3xl border-none text-white text-base font-semibold transition-colors duration-200 ${
              loading
                ? 'bg-[#93a3f8] cursor-not-allowed'
                : 'bg-[#4f6ef7] cursor-pointer hover:bg-[#3b5de7]'
            }`}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Terms checkbox */}
        <div className="flex items-start gap-2 mt-5">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 accent-[#4f6ef7] w-5 h-5 min-w-[20px] cursor-pointer"
          />
          <span className="text-gray-500 text-[0.8rem] leading-relaxed">
            I have read and accept the <span className="text-gray-900 font-semibold underline cursor-pointer">Privacy Policy</span> and <span className="text-gray-900 font-semibold underline cursor-pointer">Terms of Use</span>, and I agree that my use of the services are subject to these terms.
          </span>
        </div>

        {/* Switch to Login */}
        <div className="text-center mt-6">
          <span className="text-gray-500 text-sm">
            Already have an account?{' '}
            <span
              onClick={onSwitchToLogin}
              className="text-[#4f6ef7] font-semibold cursor-pointer"
            >
              Log In
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}

export default Register
