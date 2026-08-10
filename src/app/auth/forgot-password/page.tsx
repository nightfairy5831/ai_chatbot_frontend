import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Request from '../../../lib/request'
import { errorText } from '../../../lib/errors'

export default function ForgotPassword({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await Request.Post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      setError(errorText(err, 'Não foi possível enviar o link'))
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

        <h1 className="m-0 text-lg font-semibold text-gray-900">Esqueceu a senha?</h1>
        <p className="mt-1 mb-6 text-sm text-gray-400">
          Informe seu email e enviaremos um link para criar uma nova senha.
        </p>

        {sent ? (
          <div className="py-3 px-4 bg-green-50 border border-green-100 rounded-lg text-green-700 text-sm">
            Se esse email tiver uma conta, o link chegará em instantes. Verifique também o spam.
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <Input
              className="h-10 rounded-full text-sm"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error && <div className="py-2 px-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">{error}</div>}
            <Button type="submit" disabled={loading} className="w-full h-10 rounded-full text-sm font-semibold">
              {loading ? 'Enviando...' : 'Enviar link'}
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
