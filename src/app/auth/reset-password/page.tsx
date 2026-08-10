import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Request from '../../../lib/request'
import { errorText } from '../../../lib/errors'

export default function ResetPassword({ onDone, onBack }: { onDone: (token: string) => void; onBack: () => void }) {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('As senhas não conferem'); return }
    setLoading(true)
    setError(null)
    try {
      const data = await Request.Post('/auth/reset-password', { token, new_password: password })
      onDone(data.access_token)
    } catch (err) {
      setError(errorText(err, 'Não foi possível redefinir a senha'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white overflow-y-auto py-6">
      <div className="w-full max-w-sm px-6">
        <div className="text-center mb-6">
          <span className="text-2xl font-medium tracking-tight">
            <span className="text-gray-800">Lead</span>
            <span className="text-[#a8558f]">Lab</span>
          </span>
        </div>

        <h1 className="m-0 text-lg font-semibold text-gray-900">Nova senha</h1>
        <p className="mt-1 mb-6 text-sm text-gray-400">
          Mínimo de 8 caracteres, com maiúscula, minúscula e número.
        </p>

        {!token ? (
          <div className="py-3 px-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
            Link inválido. Solicite um novo link de redefinição.
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <Input
              className="h-10 rounded-full text-sm"
              type="password"
              placeholder="Nova senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              className="h-10 rounded-full text-sm"
              type="password"
              placeholder="Confirmar senha"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            {error && <div className="py-2 px-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">{error}</div>}
            <Button type="submit" disabled={loading} className="w-full h-10 rounded-full text-sm font-semibold">
              {loading ? 'Salvando...' : 'Redefinir senha'}
            </Button>
          </form>
        )}

        <button
          type="button"
          onClick={onBack}
          className="mt-5 text-sm text-gray-400 hover:underline bg-transparent border-none p-0 cursor-pointer"
        >
          Voltar ao login
        </button>
      </div>
    </div>
  )
}
