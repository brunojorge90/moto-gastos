import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { MotoPage } from '@/pages/MotoPage'
import { ManutencoesTiposPage } from '@/pages/ManutencoesTiposPage'
import { ManutencoesStatusPage } from '@/pages/ManutencoesStatusPage'
import { ManutencoesHistoricoPage } from '@/pages/ManutencoesHistoricoPage'
import { GastosPage } from '@/pages/GastosPage'
import { AlertasConfigPage } from '@/pages/AlertasConfigPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/moto" element={<MotoPage />} />
            <Route path="/manutencoes/tipos" element={<ManutencoesTiposPage />} />
            <Route path="/manutencoes/status" element={<ManutencoesStatusPage />} />
            <Route path="/manutencoes/historico" element={<ManutencoesHistoricoPage />} />
            <Route path="/gastos" element={<GastosPage />} />
            <Route path="/alertas" element={<AlertasConfigPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
