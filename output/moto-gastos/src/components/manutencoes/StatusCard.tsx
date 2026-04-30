import { useState } from 'react'
import { Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { AlertBadge } from './AlertBadge'
import { RegistrarManutencaoDialog } from './RegistrarManutencaoDialog'
import { formatKm, formatDate } from '@/lib/utils'
import type { ManutencaoStatusItem } from '@/types'
import { cn } from '@/lib/utils'

interface StatusCardProps {
  item: ManutencaoStatusItem
  kmAtual: number
}

export function StatusCard({ item, kmAtual }: StatusCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const kmPercorrido = kmAtual - (item.ultimaManutencao?.km_no_momento ?? 0)
  const pct = item.tipo.intervalo_km > 0
    ? Math.min(100, (kmPercorrido / item.tipo.intervalo_km) * 100)
    : 0

  return (
    <>
      <Card className={cn(item.vencida && 'border-destructive/60', item.alerta_ativo && !item.vencida && 'border-yellow-400')}>
        <CardHeader className="pb-2 flex flex-row items-start justify-between">
          <CardTitle className="text-base">{item.tipo.nome}</CardTitle>
          <AlertBadge vencida={item.vencida} alertaAtivo={item.alerta_ativo} />
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={pct} className={cn(item.vencida ? 'bg-destructive/20 [&>div]:bg-destructive' : item.alerta_ativo ? 'bg-yellow-100 [&>div]:bg-yellow-500' : '')} />

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Intervalo</p>
              <p className="font-medium">{formatKm(item.tipo.intervalo_km)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">KM restantes</p>
              <p className={cn('font-medium', item.vencida ? 'text-destructive' : item.alerta_ativo ? 'text-yellow-700' : '')}>
                {item.km_restante >= 0 ? formatKm(item.km_restante) : `-${formatKm(Math.abs(item.km_restante))}`}
              </p>
            </div>
            {item.ultimaManutencao && (
              <div>
                <p className="text-xs text-muted-foreground">Última realizada</p>
                <p className="font-medium">{formatDate(item.ultimaManutencao.data_realizacao)}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">Data estimada</p>
              <p className="font-medium">{item.data_estimada ? formatDate(item.data_estimada) : '—'}</p>
            </div>
          </div>

          <Button
            type="button"
            size="sm"
            variant={item.vencida || item.alerta_ativo ? 'default' : 'outline'}
            className="w-full"
            onClick={() => setDialogOpen(true)}
          >
            <Check className="h-4 w-4 mr-2" />
            Feito a manutenção
          </Button>
        </CardContent>
      </Card>

      {dialogOpen && (
        <RegistrarManutencaoDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          tipoId={item.tipo.id}
          tipoNome={item.tipo.nome}
          kmSugerido={kmAtual}
        />
      )}
    </>
  )
}
