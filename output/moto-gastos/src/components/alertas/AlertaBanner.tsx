import { X, AlertTriangle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AlertaBannerProps {
  message: string
  variant: 'warning' | 'destructive' | 'info'
  onClose: () => void
}

const styles: Record<AlertaBannerProps['variant'], string> = {
  warning: 'bg-yellow-50 border-yellow-300 text-yellow-800',
  destructive: 'bg-red-50 border-red-300 text-red-800',
  info: 'bg-blue-50 border-blue-300 text-blue-800',
}

const Icon = ({ variant }: { variant: AlertaBannerProps['variant'] }) => {
  if (variant === 'info') return <Info className="h-4 w-4 shrink-0" />
  return <AlertTriangle className="h-4 w-4 shrink-0" />
}

export function AlertaBanner({ message, variant, onClose }: AlertaBannerProps) {
  return (
    <div className={cn('flex items-center gap-3 border rounded-md px-4 py-3', styles[variant])}>
      <Icon variant={variant} />
      <p className="flex-1 text-sm">{message}</p>
      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
