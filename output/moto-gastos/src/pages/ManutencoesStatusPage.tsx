import { Spinner } from '@/components/ui/spinner'
import { StatusCard } from '@/components/manutencoes/StatusCard'
import { useManutencoesStatus } from '@/hooks/useManutencoes'
import { Card, CardContent } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
import { formatKm } from '@/lib/utils'

export function ManutencoesStatusPage() {
  const { data, isLoading, isError } = useManutencoesStatus()

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Erro ao carregar status. Verifique se sua moto está cadastrada.
      </div>
    )
  }

  if (!data) return null

  if (!data.moto) {
    return (
      <Card className="border-dashed">
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground mb-4">Cadastre sua moto primeiro para ver o status de manutenções.</p>
          <Link to="/moto" className={buttonVariants()}>Cadastrar Moto</Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 bg-muted/30 rounded-lg px-4 py-3">
        <div>
          <p className="text-sm text-muted-foreground">Moto</p>
          <p className="font-semibold">{data.moto.apelido || data.moto.modelo}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">KM Atual</p>
          <p className="font-semibold text-primary">{formatKm(data.km_atual ?? 0)}</p>
        </div>
      </div>

      {data.statusList.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="text-center py-10">
            <p className="text-muted-foreground mb-4">Nenhum tipo de manutenção cadastrado.</p>
            <Link to="/manutencoes/tipos" className={buttonVariants()}>Cadastrar Tipos</Link>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {data.statusList.map((item) => (
          <StatusCard key={item.tipo.id} item={item} kmAtual={data.km_atual} />
        ))}
      </div>
    </div>
  )
}
