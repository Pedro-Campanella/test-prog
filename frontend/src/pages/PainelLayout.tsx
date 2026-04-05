import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function PainelLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">Recrutamento</div>
        <nav className="nav-main">
          <NavLink to="/painel" end>
            Início
          </NavLink>
          <NavLink to="/painel/buscar">Buscar vagas</NavLink>
          <NavLink to="/painel/vagas/nova">Nova vaga</NavLink>
        </nav>
        <div className="user-area">
          <span className="muted">{user?.email}</span>
          <button type="button" className="linkish" onClick={logout}>
            Sair
          </button>
        </div>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
