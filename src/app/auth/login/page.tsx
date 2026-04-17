import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import Request from '../../../lib/request'

function Login({ onLogin, onSwitchToRegister, onBackToLanding }: { onLogin: (token: string) => void; onSwitchToRegister: () => void; onBackToLanding?: () => void }) {
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
    <div className="fixed inset-0 flex bg-white">
      {/* Left — Brand (desktop only) */}
      <div className="hidden lg:flex flex-1 bg-gray-50 flex-col items-center justify-center gap-6 border-r border-gray-100">
        <span className="text-5xl font-medium tracking-tight">
          <span className="text-gray-800">Lead</span>
          <span className="text-[#a8558f]">Lab</span>
        </span>
        <p className="text-sm text-gray-400 max-w-xs text-center leading-relaxed">
          O futuro das vendas PME é automático e descomplicado.
        </p>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center overflow-y-auto py-6">
        <div className="w-full max-w-sm px-6">
          {onBackToLanding && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToLanding}
              className="mb-6 gap-1.5 text-gray-400 hover:text-gray-700 -ml-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
              </svg>
              Voltar
            </Button>
          )}

          {/* Logo (mobile only) */}
          <div className="text-center mb-6 lg:hidden">
            <span className="text-2xl font-medium tracking-tight">
              <span className="text-gray-800">Lead</span>
              <span className="text-[#a8558f]">Lab</span>
            </span>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="m-0 text-lg font-semibold text-gray-900">Bem-vindo de volta</h1>
            <p className="mt-1 text-sm text-gray-400">Faça login para continuar</p>
          </div>

          {/* Google */}
          <Button variant="outline" className="w-full h-10 rounded-full text-sm font-medium gap-2 mb-4">
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Entrar com Google
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <Separator className="flex-1" />
            <span className="text-gray-400 text-xs">ou</span>
            <Separator className="flex-1" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input className="h-10 rounded-full text-sm" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <div className="relative">
              <Input className="h-10 rounded-full text-sm pr-10" type={showPassword ? 'text' : 'password'} placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer flex items-center p-0 bg-transparent border-none outline-none"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                )}
              </button>
            </div>

            {error && (
              <div className="py-2 px-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">{error}</div>
            )}

            <Button type="submit" disabled={loading} className="w-full h-10 rounded-full text-sm font-semibold">
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* Footer */}
          <div className="flex justify-between items-center mt-5 text-sm">
            <span className="text-gray-400">
              Não tem conta?{' '}
              <span onClick={onSwitchToRegister} className="text-[#a8558f] font-medium cursor-pointer hover:underline">Criar conta</span>
            </span>
            <span className="text-gray-400 text-xs cursor-pointer hover:underline">Esqueceu a senha?</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
