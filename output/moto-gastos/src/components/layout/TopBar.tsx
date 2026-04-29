import { LogOut, Bike } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { useMoto } from '@/hooks/useMoto'
import { formatKm } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function TopBar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { data } = useMoto()

  const moto = data?.moto
  const kmAtual = data?.km_atual
  const initial = user?.email?.[0]?.toUpperCase() ?? '?'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="h-14 border-b bg-card flex items-center px-4 gap-4 shrink-0">
      {/* Logo — mobile only (desktop shows in sidebar) */}
      <div className="lg:hidden flex items-center gap-2">
        <Bike className="h-6 w-6 text-primary" />
        <span className="font-bold text-base tracking-tight">MotoGastos</span>
      </div>

      {/* Moto info — desktop only */}
      {moto && (
        <div className="hidden lg:flex items-center gap-3">
          <span className="text-sm font-semibold">{moto.apelido || moto.modelo}</span>
          {kmAtual != null && (
            <span className={cn(
              'text-xs font-mono px-2 py-0.5 rounded-md bg-accent text-primary font-semibold'
            )}>
              {formatKm(kmAtual)}
            </span>
          )}
        </div>
      )}

      <div className="flex-1" />

      {/* Avatar + logout */}
      <div className="flex items-center gap-3">
        <div
          className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0"
          title={user?.email}
        >
          {initial}
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} title="Sair">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
