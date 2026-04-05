import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { BuscarVagas } from './pages/BuscarVagas'
import { Login } from './pages/Login'
import { NovaVaga } from './pages/NovaVaga'
import { PainelInicio } from './pages/PainelInicio'
import { PainelLayout } from './pages/PainelLayout'
import { Register } from './pages/Register'
import { GuestOnlyRoute } from './routes/GuestOnlyRoute'
import { ProtectedRoute } from './routes/ProtectedRoute'
import './App.css'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/painel" replace />} />
          <Route element={<GuestOnlyRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/painel" element={<PainelLayout />}>
              <Route index element={<PainelInicio />} />
              <Route path="buscar" element={<BuscarVagas />} />
              <Route path="vagas/nova" element={<NovaVaga />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/painel" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
