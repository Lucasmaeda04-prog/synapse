import { useEffect, useState } from 'react'
import './App.css'

type Health = {
  status: string
  db?: 'up' | 'down'
  dbState?: number
  timestamp: string
}

function App() {
  const [health, setHealth] = useState<Health | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const api = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    fetch(`${api}/health`, { credentials: 'include' })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data: Health) => setHealth(data))
      .catch((err: unknown) => setError((err as Error).message))
  }, [])

  return (
    <div style={{ padding: 24 }}>
      <h1>Synapse — Web</h1>
      <p>
        API: <code>{import.meta.env.VITE_API_URL || 'http://localhost:3000'}</code>
      </p>
      <h2>Health</h2>
      {!health && !error && <p>Carregando...</p>}
      {error && (
        <p style={{ color: 'crimson' }}>Erro ao consultar /health: {error}</p>
      )}
      {health && (
        <pre style={{ background: '#f5f5f5', padding: 12 }}>
{JSON.stringify(health, null, 2)}
        </pre>
      )}
    </div>
  )
}

export default App
