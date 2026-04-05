import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export function NovaVaga() {
  const nav = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await api.post('/api/jobs', { title, description })
      nav('/painel')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || 'Não foi possível criar a vaga.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page narrow">
      <h1>Nova vaga</h1>
      <p className="muted">Publique uma vaga para receber candidaturas.</p>
      <form onSubmit={onSubmit} className="stack card flat">
        <label>
          Título
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Ex.: Desenvolvedor Backend"
          />
        </label>
        <label>
          Descrição
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            placeholder="Requisitos, benefícios, localização…"
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Salvando…' : 'Publicar vaga'}
        </button>
      </form>
    </div>
  )
}
