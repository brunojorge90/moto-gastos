import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ManutencaoTipo } from '@/types'

const schema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  intervalo_km: z.coerce.number().int().min(1, 'Intervalo deve ser >= 1'),
})

type FormValues = z.infer<typeof schema>

interface TipoFormProps {
  defaultValues?: Partial<ManutencaoTipo>
  onSubmit: (data: FormValues) => void
  isLoading?: boolean
  submitLabel?: string
  onCancel?: () => void
}

export function TipoForm({ defaultValues, onSubmit, isLoading, submitLabel = 'Salvar', onCancel }: TipoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: defaultValues?.nome ?? '',
      intervalo_km: defaultValues?.intervalo_km ?? 1000,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="nome">Nome</Label>
        <Input id="nome" {...register('nome')} placeholder="Ex: Troca de óleo" />
        {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="intervalo_km">Intervalo (km)</Label>
        <Input id="intervalo_km" type="number" {...register('intervalo_km')} />
        {errors.intervalo_km && (
          <p className="text-xs text-destructive">{errors.intervalo_km.message}</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}
