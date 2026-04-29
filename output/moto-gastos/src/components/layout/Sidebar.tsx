import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Bike,
  Wrench,
  History,
  DollarSign,
  Bell,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5 shrink-0" /> },
  { to: '/moto', label: 'Minha Moto', icon: <Bike className="h-5 w-5 shrink-0" /> },
  { to: '/manutencoes/status', label: 'Status', icon: <Wrench className="h-5 w-5 shrink-0" /> },
  { to: '/manutencoes/historico', label: 'Registrar', icon: <History className="h-5 w-5 shrink-0" /> },
  { to: '/gastos', label: 'Gastos', icon: <DollarSign className="h-5 w-5 shrink-0" /> },
  { to: '/alertas', label: 'Alertas', icon: <Bell className="h-5 w-5 shrink-0" /> },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col h-full bg-card border-r transition-all duration-200 shrink-0',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-3 h-14 border-b shrink-0 overflow-hidden">
        <Bike className="h-6 w-6 text-primary shrink-0" />
        {!collapsed && (
          <span className="font-bold text-base tracking-tight whitespace-nowrap">MotoGastos</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center rounded-lg px-2 py-2.5 text-sm font-medium transition-colors',
                collapsed ? 'justify-center gap-0' : 'gap-3',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )
            }
          >
            {item.icon}
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Toggle */}
      <div className="border-t p-2 shrink-0">
        <button
          onClick={onToggle}
          className="w-full flex justify-center p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  )
}
