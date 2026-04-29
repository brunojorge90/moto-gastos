import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { HistoricoTable } from '@/components/manutencoes/HistoricoTable'
import { RealizadaForm } from '@/components/manutencoes/RealizadaForm'
import {
  useManutencoesRealizadas,
  useManutencoesTipos,
  useCreateRealizada,
  useDeleteRealizada,
} from '@/hooks/useManutencoes'
import { useMoto } from '@/hooks/useMoto'
import type { CreateRealizadaPayload } from '@/api/manutencoes'

export function ManutencoesHistoricoPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [tipoFiltro, setTipoFiltro] = useState<string | undefined>()
  const [deletingId, setDeletingId] = useState<string | undefined>()

  const filtros = { limit: 50, offset: 0, ...(tipoFiltro ? { tipo_manutencao_id: tipoFiltro } : {}) }

  const { data: realizadas, isLoading } = useManutencoesRealizadas(filtros)
  const { data: tiposData } = useManutencoesTipos()
  const { data: motoData } = useMoto()
  const createRealizada = useCreateRealizada()
  const deleteRealizada = useDeleteRealizada()

  const handleCreate = async (values: CreateRealizadaPayload) => {
    await createRealizada.mutateAsync(values)
    setShowCreate(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este registro?')) return
    setDeletingId(id)
    try {
      await deleteRealizada.mutateAsync(id)
    } finally {
      setDeletingId(undefined)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <Select
            value={tipoFiltro?.toString() ?? ''}
            onChange={(e) => setTipoFiltro(e.target.value || undefined)}
            className="w-52"
          >
            <option value="">Todos os tipos</option>
            {tiposData?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </Select>
        </div>

        <Button onClick={() => setShowCreate(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Registrar Manutenção
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <HistoricoTable
          items={realizadas ?? []}
          onDelete={handleDelete}
          isDeletingId={deletingId}
        />
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent onClose={() => setShowCreate(false)}>
          <DialogHeader>
            <DialogTitle>Registrar Manutenção</DialogTitle>
          </DialogHeader>
          <RealizadaForm
            tipos={tiposData ?? []}
            kmAtual={motoData?.km_atual ?? 0}
            onSubmit={handleCreate}
            isLoading={createRealizada.isPending}
            onCancel={() => setShowCreate(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
