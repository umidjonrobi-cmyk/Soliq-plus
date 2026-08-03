import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { LangProvider } from './i18n'
import { AppProvider, useStore } from './store'
import { Layout } from './components/Layout'
import Landing from './pages/Landing'
import { Login, Register } from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Companies from './pages/Companies'
import Accounts from './pages/Accounts'
import Entries from './pages/Entries'
import { Cash, Bank } from './pages/CashBank'
import Trade from './pages/Trade'
import Inventory from './pages/Inventory'
import Assets from './pages/Assets'
import Payroll from './pages/Payroll'
import Reports from './pages/Reports'
import Eimzo from './pages/Eimzo'
import Integrations from './pages/Integrations'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

function Protected({ children }: { children: ReactNode }) {
  const { user, authReady } = useStore()
  if (!authReady) {
    return (
      <div className="grid min-h-screen place-items-center" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return <Layout>{children}</Layout>
}

export default function App() {
  return (
    <LangProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/app" element={<Protected><Dashboard /></Protected>} />
            <Route path="/app/companies" element={<Protected><Companies /></Protected>} />
            <Route path="/app/accounts" element={<Protected><Accounts /></Protected>} />
            <Route path="/app/entries" element={<Protected><Entries /></Protected>} />
            <Route path="/app/cash" element={<Protected><Cash /></Protected>} />
            <Route path="/app/bank" element={<Protected><Bank /></Protected>} />
            <Route path="/app/trade" element={<Protected><Trade /></Protected>} />
            <Route path="/app/inventory" element={<Protected><Inventory /></Protected>} />
            <Route path="/app/assets" element={<Protected><Assets /></Protected>} />
            <Route path="/app/payroll" element={<Protected><Payroll /></Protected>} />
            <Route path="/app/reports" element={<Protected><Reports /></Protected>} />
            <Route path="/app/eimzo" element={<Protected><Eimzo /></Protected>} />
            <Route path="/app/integrations" element={<Protected><Integrations /></Protected>} />
            <Route path="/app/settings" element={<Protected><Settings /></Protected>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </LangProvider>
  )
}
