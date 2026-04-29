import { useState } from 'react'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { ResumoCard } from '@/components/gastos/ResumoCard'
import { GastosPorTipoChart } from '@/components/gastos/GastosPorTipoChart'
import { GastosMensalChart } from '@/components/gastos/GastosMensalChart'
import { useGastosResumo } from '@/hooks/useGastos'

const periodoOptions = [
  { label: 'Últimos 3 meses', value: 3 },
  { label: 'Últimos 6 meses', value: 6 },
  { label: 'Últimos 12 meses', value: 12 },
  { label: 'Últimos 24 meses', value: 24 },
]

export function GastosPage() {
  const [periodo, setPeriodo] = useState(12)
  const { data, isLoading } = useGastosResumo(periodo)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Label>Período</Label>
        <Select
          value={periodo.toString()}
          onChange={(e) => setPeriodo(Number(e.target.value))}
          className="w-52"
        >
          {periodoOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : data ? (
        <>
          <ResumoCard resumo={data} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.por_tipo.length > 0 && <GastosPorTipoChart data={data.por_tipo} />}
            {data.mensal.length > 0 && <GastosMensalChart data={data.mensal} />}
          </div>

          {data.por_tipo.length === 0 && data.mensal.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              Nenhum gasto registrado no período.
            </p>
          )}
        </>
      ) : null}
    </div>
  )
}
