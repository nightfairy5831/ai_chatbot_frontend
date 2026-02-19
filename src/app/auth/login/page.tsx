import { useState } from 'react'
import Request from '../../../lib/request'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.875rem 1rem',
  borderRadius: '24px',
  border: '1px solid #e5e7eb',
  fontSize: '0.95rem',
  outline: 'none',
  boxSizing: 'border-box',
  color: '#1f2937',
  background: '#fff',
  transition: 'border-color 0.2s',
}

function Login({ onLogin, onSwitchToRegister }: { onLogin: (token: string) => void; onSwitchToRegister: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await Request.Post('/auth/login', { email, password })
      onLogin(data.access_token)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fafafa',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        padding: '0 1.5rem',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#1a1a2e',
            letterSpacing: '-0.02em',
          }}>
            <span style={{ fontSize: '1.75rem' }}>🤖</span>
            <span>AI Chatbot</span>
          </div>
        </div>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            margin: 0,
            fontSize: '2.25rem',
            fontWeight: 800,
            color: '#111827',
            lineHeight: 1.2,
          }}>
            Welcome Back
          </h1>
          <p style={{
            margin: '0.75rem 0 0',
            fontSize: '1.1rem',
            color: '#6b7280',
          }}>
            Build Amazing <span style={{ color: '#4f6ef7' }}>AI Agent</span><span style={{ color: '#a855f6' }}>s</span>
          </p>
        </div>

        {/* Google Sign In */}
        <button
          type="button"
          style={{
            width: '100%',
            padding: '0.875rem',
            borderRadius: '24px',
            border: '1px solid #e5e7eb',
            background: '#fff',
            fontSize: '0.95rem',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            color: '#374151',
            transition: 'background 0.2s',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign In With Google
        </button>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          margin: '1.5rem 0',
        }}>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Or</span>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              className="auth-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
            <input
              className="auth-input"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ ...inputStyle, paddingRight: '3rem' }}
            />
            <button
              className="password-toggle"
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
            <div style={{
              marginBottom: '1rem',
              padding: '0.75rem 1rem',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              color: '#dc2626',
              fontSize: '0.875rem',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem',
              borderRadius: '24px',
              border: 'none',
              background: loading ? '#93a3f8' : '#4f6ef7',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        {/* Forgot Password & Sign Up */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem' }}>
          <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            Don't have an account?{' '}
            <span
              onClick={onSwitchToRegister}
              style={{ color: '#4f6ef7', fontWeight: 600, cursor: 'pointer' }}
            >
              Sign Up
            </span>
          </span>
          <span style={{
            color: '#111827',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}>
            Forgot Password?
          </span>
        </div>
      </div>
    </div>
  )
}

export default Login
