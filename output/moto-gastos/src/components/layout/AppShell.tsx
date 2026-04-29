import { useState } from 'react'
import { Outlet, useLocation, NavLink } from 'react-router-dom'
import { LayoutDashboard, Bike, Wrench, DollarSign, Bell } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { cn } from '@/lib/utils'

const bottomNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/moto', icon: Bike, label: 'Moto' },
  { to: '/manutencoes/status', icon: Wrench, label: 'Manutenção', matchPrefix: '/manutencoes' },
  { to: '/gastos', icon: DollarSign, label: 'Gastos' },
  { to: '/alertas', icon: Bell, label: 'Alertas' },
]

export function AppShell() {
  const [collapsed, setCollapsed] = useState(true)
  const location = useLocation()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 lg:pb-6">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 border-t bg-card z-40 flex">
          {bottomNavItems.map((item) => {
            const isActive = item.matchPrefix
              ? location.pathname.startsWith(item.matchPrefix)
              : location.pathname === item.to || location.pathname.startsWith(item.to + '/')
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  'flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
