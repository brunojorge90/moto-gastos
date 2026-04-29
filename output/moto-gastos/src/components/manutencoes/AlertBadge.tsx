import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface AlertBadgeProps {
  vencida: boolean
  alertaAtivo: boolean
}

export function AlertBadge({ vencida, alertaAtivo }: AlertBadgeProps) {
  if (vencida) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        Vencida
      </Badge>
    )
  }
  if (alertaAtivo) {
    return (
      <Badge variant="warning" className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        Alerta
      </Badge>
    )
  }
  return (
    <Badge variant="success" className="flex items-center gap-1">
      <CheckCircle className="h-3 w-3" />
      OK
    </Badge>
  )
}
