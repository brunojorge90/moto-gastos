import { Bike, Edit } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatKm, formatDate } from '@/lib/utils'
import type { Moto } from '@/types'

interface MotoCardProps {
  moto: Moto
  kmAtual: number
  onEdit: () => void
}

export function MotoCard({ moto, kmAtual, onEdit }: MotoCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Bike className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl">{moto.apelido}</CardTitle>
        </div>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit className="h-4 w-4 mr-1" />
          Editar
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Modelo</p>
            <p className="font-semibold mt-0.5">{moto.modelo}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Ano</p>
            <p className="font-semibold mt-0.5">{moto.ano}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">KM Atual (estimado)</p>
            <p className="font-semibold mt-0.5 text-primary">{formatKm(kmAtual)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">KM Inicial</p>
            <p className="font-semibold mt-0.5">{formatKm(moto.km_inicial)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Média diária</p>
            <p className="font-semibold mt-0.5">{formatKm(moto.media_diaria_km)}/dia</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Data de referência</p>
            <p className="font-semibold mt-0.5">{formatDate(moto.data_referencia)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
