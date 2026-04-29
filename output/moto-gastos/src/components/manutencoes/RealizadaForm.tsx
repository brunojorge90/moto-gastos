import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { ManutencaoTipo } from '@/types'

const schema = z.object({
  tipo_manutencao_id: z.string().min(1, 'Selecione um tipo'),
  data_realizacao: z.string().min(1, 'Data é obrigatória'),
  km_no_momento: z.coerce.number().min(0, 'KM deve ser >= 0'),
  valor_gasto: z.coerce.number().min(0, 'Valor deve ser >= 0'),
  observacao: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface RealizadaFormProps {
  tipos: ManutencaoTipo[]
  kmAtual: number
  onSubmit: (data: FormValues) => void
  isLoading?: boolean
  onCancel?: () => void
}

export function RealizadaForm({ tipos, kmAtual, onSubmit, isLoading, onCancel }: RealizadaFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipo_manutencao_id: undefined,
      data_realizacao: new Date().toISOString().split('T')[0],
      km_no_momento: kmAtual,
      valor_gasto: 0,
      observacao: '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="tipo_manutencao_id">Tipo de Manutenção</Label>
        <Select id="tipo_manutencao_id" {...register('tipo_manutencao_id')}>
          <option value="">Selecione...</option>
          {tipos.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </Select>
        {errors.tipo_manutencao_id && (
          <p className="text-xs text-destructive">{errors.tipo_manutencao_id.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="data_realizacao">Data de Realização</Label>
          <Input id="data_realizacao" type="date" {...register('data_realizacao')} />
          {errors.data_realizacao && (
            <p className="text-xs text-destructive">{errors.data_realizacao.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="km_no_momento">KM no Momento</Label>
          <Input id="km_no_momento" type="number" {...register('km_no_momento')} />
          {errors.km_no_momento && (
            <p className="text-xs text-destructive">{errors.km_no_momento.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="valor_gasto">Valor Gasto (R$)</Label>
          <Input id="valor_gasto" type="number" step="0.01" {...register('valor_gasto')} />
          {errors.valor_gasto && (
            <p className="text-xs text-destructive">{errors.valor_gasto.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="observacao">Observação (opcional)</Label>
        <Textarea id="observacao" {...register('observacao')} rows={3} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Registrando...' : 'Registrar Manutenção'}
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
