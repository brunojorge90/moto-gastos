import { Bike, Wrench, DollarSign, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { useMoto } from '@/hooks/useMoto'
import { useManutencoesStatus } from '@/hooks/useManutencoes'
import { useGastosResumo } from '@/hooks/useGastos'
import { formatKm, formatCurrency } from '@/lib/utils'
import { AlertBadge } from '@/components/manutencoes/AlertBadge'
import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'

export function DashboardPage() {
  const motoQuery = useMoto()
  const statusQuery = useManutencoesStatus()
  const gastosQuery = useGastosResumo(12)

  const isLoading = motoQuery.isLoading || statusQuery.isLoading || gastosQuery.isLoading

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    )
  }

  const moto = motoQuery.data?.moto
  const kmAtual = motoQuery.data?.km_atual ?? 0
  const statusList = statusQuery.data?.statusList ?? []
  const gastos = gastosQuery.data
  const alertasAtivos = statusList.filter((s) => s.alerta_ativo || s.vencida)

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">KM Atual</CardTitle>
            <Bike className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{moto ? formatKm(kmAtual) : '—'}</p>
            {moto && <p className="text-xs text-muted-foreground mt-1">{moto.apelido}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Manutenções</CardTitle>
            <Wrench className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{statusList.length}</p>
            <p className="text-xs text-muted-foreground mt-1">tipos cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Alertas Ativos</CardTitle>
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{alertasAtivos.length}</p>
            <p className="text-xs text-muted-foreground mt-1">precisam de atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gastos (12m)</CardTitle>
            <DollarSign className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {gastos ? formatCurrency(gastos.total_periodo) : '—'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">últimos 12 meses</p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {alertasAtivos.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-base font-semibold">Atenção necessária</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alertasAtivos.map((item) => (
              <Card key={item.tipo.id} className="border-yellow-300">
                <CardContent className="flex items-center justify-between pt-4 pb-3">
                  <div>
                    <p className="font-medium">{item.tipo.nome}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {item.vencida
                        ? `Vencida há ${formatKm(Math.abs(item.km_restante))}`
                        : `Faltam ${formatKm(item.km_restante)}`}
                    </p>
                  </div>
                  <AlertBadge vencida={item.vencida} alertaAtivo={item.alerta_ativo} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Sem moto cadastrada */}
      {!moto && (
        <Card className="border-dashed">
          <CardContent className="text-center py-12">
            <Bike className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">Você ainda não cadastrou sua moto.</p>
            <Link to="/moto" className={buttonVariants()}>Cadastrar Moto</Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
