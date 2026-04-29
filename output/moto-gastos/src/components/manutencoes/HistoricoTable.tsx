import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatKm, formatCurrency, formatDate } from '@/lib/utils'
import type { ManutencaoRealizada } from '@/types'

interface HistoricoTableProps {
  items: ManutencaoRealizada[]
  onDelete: (id: number) => void
  isDeletingId?: number
}

export function HistoricoTable({ items, onDelete, isDeletingId }: HistoricoTableProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhuma manutenção registrada.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Data</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">KM</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Valor</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Observação</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3 font-medium">
                {item.tipo?.nome ?? `Tipo ${item.tipo_manutencao_id}`}
              </td>
              <td className="px-4 py-3">{formatDate(item.data_realizacao)}</td>
              <td className="px-4 py-3">{formatKm(item.km_no_momento)}</td>
              <td className="px-4 py-3">{formatCurrency(item.valor_gasto)}</td>
              <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                {item.observacao || '—'}
              </td>
              <td className="px-4 py-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(item.id)}
                  disabled={isDeletingId === item.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
