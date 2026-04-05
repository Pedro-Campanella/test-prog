import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import type { Application, Job } from '../types'

export function PainelInicio() {
  const { user } = useAuth()
  const [tab, setTab] = useState<'vagas' | 'candidaturas'>('vagas')
  const [myJobs, setMyJobs] = useState<Job[]>([])
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  const load = useCallback(async () => {
    setErr(null)
    setLoading(true)
    try {
      const [jRes, aRes] = await Promise.all([
        api.get<Job[]>('/api/jobs/mine'),
        api.get<Application[]>('/api/applications/mine'),
      ])
      setMyJobs(jRes.data)
      setApps(aRes.data)
    } catch {
      setErr('Não foi possível carregar seus dados.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="page">
      <h1>Área logada</h1>
      <p className="muted">
        Olá, <strong>{user?.email}</strong>. Gerencie suas vagas e candidaturas.
      </p>

      <div className="tabs">
        <button
          type="button"
          className={tab === 'vagas' ? 'tab active' : 'tab'}
          onClick={() => setTab('vagas')}
        >
          Minhas vagas
        </button>
        <button
          type="button"
          className={tab === 'candidaturas' ? 'tab active' : 'tab'}
          onClick={() => setTab('candidaturas')}
        >
          Minhas candidaturas
        </button>
      </div>

      {err && <p className="error">{err}</p>}
      {loading ? (
        <p className="muted">Carregando…</p>
      ) : tab === 'vagas' ? (
        <section className="panel">
          <div className="panel-head">
            <h2>Vagas que você publicou</h2>
            <button type="button" className="secondary" onClick={() => void load()}>
              Atualizar
            </button>
          </div>
          {myJobs.length === 0 ? (
            <p className="muted">Você ainda não cadastrou vagas.</p>
          ) : (
            <ul className="list">
              {myJobs.map((j) => (
                <li key={j.id} className="list-item">
                  <strong>{j.title}</strong>
                  <p className="muted small">{j.description || '—'}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <section className="panel">
          <div className="panel-head">
            <h2>Suas candidaturas</h2>
            <button type="button" className="secondary" onClick={() => void load()}>
              Atualizar
            </button>
          </div>
          {apps.length === 0 ? (
            <p className="muted">Você ainda não se candidatou a vagas.</p>
          ) : (
            <ul className="list">
              {apps.map((a) => (
                <li key={a.id} className="list-item">
                  <strong>{a.job?.title ?? `Vaga #${a.job_id}`}</strong>
                  <p className="muted small">{a.job?.description || '—'}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}
