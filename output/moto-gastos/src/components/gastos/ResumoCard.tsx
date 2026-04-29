import { DollarSign, TrendingUp, Clock, BarChart2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { GastosResumoResponse } from '@/types'

interface ResumoCardProps {
  resumo: GastosResumoResponse
}

export function ResumoCard({ resumo }: ResumoCardProps) {
  const mediaMensal = resumo.periodo_meses > 0
    ? resumo.total_periodo / resumo.periodo_meses
    : 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Geral
          </CardTitle>
          <DollarSign className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(resumo.total_geral)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Últimos {resumo.periodo_meses}m
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(resumo.total_periodo)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Média Mensal
          </CardTitle>
          <BarChart2 className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(mediaMensal)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Último Gasto
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {resumo.ultima_manutencao ? (
            <>
              <p className="text-2xl font-bold">{formatCurrency(resumo.ultima_manutencao.valor_gasto)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDate(resumo.ultima_manutencao.data_realizacao)}
              </p>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">—</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
