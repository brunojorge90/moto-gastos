import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Moto } from '@/types'

const schema = z.object({
  apelido: z.string().min(1, 'Apelido é obrigatório'),
  modelo: z.string().min(1, 'Modelo é obrigatório'),
  ano: z.coerce.number().int().min(1900).max(2100),
  km_inicial: z.coerce.number().min(0, 'KM inicial deve ser >= 0'),
  media_diaria_km: z.coerce.number().min(0, 'Média diária deve ser >= 0'),
  data_referencia: z.string().min(1, 'Data de referência é obrigatória'),
})

type FormValues = z.infer<typeof schema>

interface MotoFormProps {
  defaultValues?: Partial<Moto>
  onSubmit: (data: FormValues) => void
  isLoading?: boolean
  submitLabel?: string
}

export function MotoForm({ defaultValues, onSubmit, isLoading, submitLabel = 'Salvar' }: MotoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      apelido: defaultValues?.apelido ?? '',
      modelo: defaultValues?.modelo ?? '',
      ano: defaultValues?.ano ?? new Date().getFullYear(),
      km_inicial: defaultValues?.km_inicial ?? 0,
      media_diaria_km: defaultValues?.media_diaria_km ?? 0,
      data_referencia: defaultValues?.data_referencia
        ? defaultValues.data_referencia.split('T')[0]
        : new Date().toISOString().split('T')[0],
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="apelido">Apelido</Label>
          <Input id="apelido" {...register('apelido')} placeholder="Ex: Hornet" />
          {errors.apelido && <p className="text-xs text-destructive">{errors.apelido.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="modelo">Modelo</Label>
          <Input id="modelo" {...register('modelo')} placeholder="Ex: Honda CB 600F" />
          {errors.modelo && <p className="text-xs text-destructive">{errors.modelo.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="ano">Ano</Label>
          <Input id="ano" type="number" {...register('ano')} />
          {errors.ano && <p className="text-xs text-destructive">{errors.ano.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="km_inicial">KM Inicial</Label>
          <Input id="km_inicial" type="number" {...register('km_inicial')} />
          {errors.km_inicial && <p className="text-xs text-destructive">{errors.km_inicial.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="media_diaria_km">Média diária (km/dia)</Label>
          <Input id="media_diaria_km" type="number" step="0.1" {...register('media_diaria_km')} />
          {errors.media_diaria_km && (
            <p className="text-xs text-destructive">{errors.media_diaria_km.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="data_referencia">Data de Referência</Label>
          <Input id="data_referencia" type="date" {...register('data_referencia')} />
          {errors.data_referencia && (
            <p className="text-xs text-destructive">{errors.data_referencia.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
        {isLoading ? 'Salvando...' : submitLabel}
      </Button>
    </form>
  )
}
