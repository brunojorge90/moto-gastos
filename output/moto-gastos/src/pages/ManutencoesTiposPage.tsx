import { useState } from 'react'
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { TipoForm } from '@/components/manutencoes/TipoForm'
import {
  useManutencoesTipos,
  useCreateTipo,
  useUpdateTipo,
  useDeleteTipo,
} from '@/hooks/useManutencoes'
import { formatKm } from '@/lib/utils'
import type { ManutencaoTipo } from '@/types'

export function ManutencoesTiposPage() {
  const { data: tipos, isLoading } = useManutencoesTipos()
  const createTipo = useCreateTipo()
  const updateTipo = useUpdateTipo()
  const deleteTipo = useDeleteTipo()

  const [showCreate, setShowCreate] = useState(false)
  const [editingTipo, setEditingTipo] = useState<ManutencaoTipo | null>(null)

  const handleCreate = async (values: { nome: string; intervalo_km: number }) => {
    await createTipo.mutateAsync(values)
    setShowCreate(false)
  }

  const handleUpdate = async (values: { nome: string; intervalo_km: number }) => {
    if (!editingTipo) return
    await updateTipo.mutateAsync({ id: editingTipo.id, payload: values })
    setEditingTipo(null)
  }

  const handleToggleAtivo = (tipo: ManutencaoTipo) => {
    updateTipo.mutate({ id: tipo.id, payload: { ativo: !tipo.ativo } })
  }

  const handleDelete = (id: string) => {
    if (confirm('Deseja excluir este tipo? Isso removerá o histórico associado.')) {
      deleteTipo.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{tipos?.length ?? 0} tipos cadastrados</p>
        <Button onClick={() => setShowCreate(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Novo Tipo
        </Button>
      </div>

      {tipos?.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="text-center py-10 text-muted-foreground">
            Nenhum tipo cadastrado ainda.
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {tipos?.map((tipo) => (
          <Card key={tipo.id} className={!tipo.ativo ? 'opacity-60' : ''}>
            <CardContent className="flex items-center justify-between pt-4 pb-3">
              <div>
                <p className="font-medium">{tipo.nome}</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Intervalo: {formatKm(tipo.intervalo_km)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={tipo.ativo ? 'success' : 'secondary'}>
                  {tipo.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleAtivo(tipo)}
                  title={tipo.ativo ? 'Desativar' : 'Ativar'}
                >
                  {tipo.ativo ? (
                    <ToggleRight className="h-4 w-4 text-primary" />
                  ) : (
                    <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setEditingTipo(tipo)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(tipo.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog: Criar */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent onClose={() => setShowCreate(false)}>
          <DialogHeader>
            <DialogTitle>Novo Tipo de Manutenção</DialogTitle>
          </DialogHeader>
          <TipoForm
            onSubmit={handleCreate}
            isLoading={createTipo.isPending}
            submitLabel="Criar"
            onCancel={() => setShowCreate(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar */}
      <Dialog open={!!editingTipo} onOpenChange={(open) => !open && setEditingTipo(null)}>
        <DialogContent onClose={() => setEditingTipo(null)}>
          <DialogHeader>
            <DialogTitle>Editar Tipo</DialogTitle>
          </DialogHeader>
          {editingTipo && (
            <TipoForm
              defaultValues={editingTipo}
              onSubmit={handleUpdate}
              isLoading={updateTipo.isPending}
              submitLabel="Salvar"
              onCancel={() => setEditingTipo(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
