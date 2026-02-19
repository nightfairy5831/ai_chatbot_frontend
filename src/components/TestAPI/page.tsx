import { useState } from 'react'
import Request from '../../lib/request'

function TestAPI() {
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleHealthCheck = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await Request.Get('/health')
      setResponse(data)
    } catch (err: any) {
      setError(err.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>API Test</h2>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button onClick={handleHealthCheck}>Health Check</button>
      </div>

      {loading && <p>Loading...</p>}

      {error && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#fee2e2', borderRadius: '8px', color: '#dc2626' }}>
          {error}
        </div>
      )}

      {response && (
        <pre style={{ marginTop: '1rem', padding: '1rem', background: '#f3f4f6', borderRadius: '8px', textAlign: 'left', color: '#1f2937' }}>
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  )
}

export default TestAPI
