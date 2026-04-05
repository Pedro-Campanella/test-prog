import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import type { Application, Job } from '../types'

export function BuscarVagas() {
  const { user } = useAuth()
  const [q, setQ] = useState('')
  const [jobs, setJobs] = useState<Job[]>([])
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const appliedIds = useMemo(
    () => new Set(apps.map((a) => a.job_id)),
    [apps],
  )

  const refreshApps = useCallback(async () => {
    const { data } = await api.get<Application[]>('/api/applications/mine')
    setApps(data)
  }, [])

  const fetchJobs = useCallback(async (query: string) => {
    setMsg(null)
    setLoading(true)
    try {
      const { data } = await api.get<Job[]>('/api/jobs', {
        params: query.trim() ? { q: query.trim() } : {},
      })
      setJobs(data)
    } catch {
      setMsg('Erro ao buscar vagas.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshApps()
  }, [refreshApps])

  useEffect(() => {
    void fetchJobs('')
  }, [fetchJobs])

  async function apply(jobId: number) {
    setMsg(null)
    try {
      await api.post(`/api/jobs/${jobId}/apply`)
      await refreshApps()
      setMsg('Candidatura registrada.')
    } catch (err: unknown) {
      const m =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || 'Não foi possível candidatar-se.'
      setMsg(m)
    }
  }

  return (
    <div className="page">
      <h1>Buscar vagas</h1>
      <form
        className="search-row"
        onSubmit={(e) => {
          e.preventDefault()
          void fetchJobs(q)
        }}
      >
        <input
          type="search"
          placeholder="Palavras no título ou descrição…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Buscando…' : 'Buscar'}
        </button>
      </form>
      {msg && <p className={msg.includes('registrada') ? 'success' : 'error'}>{msg}</p>}
      <ul className="list">
        {jobs.map((j) => {
          const own = user?.id === j.owner_id
          const applied = appliedIds.has(j.id)
          return (
            <li key={j.id} className="list-item">
              <div className="job-row">
                <div>
                  <strong>{j.title}</strong>
                  <p className="muted small">{j.description || '—'}</p>
                </div>
                <div className="job-actions">
                  {own ? (
                    <span className="badge">Sua vaga</span>
                  ) : applied ? (
                    <span className="badge muted">Candidatado</span>
                  ) : (
                    <button type="button" onClick={() => void apply(j.id)}>
                      Candidatar-se
                    </button>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
      {!loading && jobs.length === 0 && (
        <p className="muted">Nenhuma vaga encontrada.</p>
      )}
    </div>
  )
}
