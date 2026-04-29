import { useState } from 'react'
import { Plus } from 'lucide-react'
import { MotoCard } from '@/components/moto/MotoCard'
import { MotoForm } from '@/components/moto/MotoForm'
import { Spinner } from '@/components/ui/spinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useMoto, useCreateMoto, useUpdateMoto } from '@/hooks/useMoto'
import type { Moto } from '@/types'

export function MotoPage() {
  const [showForm, setShowForm] = useState(false)
  const { data, isLoading } = useMoto()
  const createMoto = useCreateMoto()
  const updateMoto = useUpdateMoto()

  const hasMoto = !!data?.moto

  const handleCreate = async (values: Omit<Moto, 'id'>) => {
    await createMoto.mutateAsync(values)
    setShowForm(false)
  }

  const handleUpdate = async (values: Partial<Moto>) => {
    await updateMoto.mutateAsync(values)
    setShowForm(false)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {hasMoto && data ? (
        <>
          <MotoCard
            moto={data.moto}
            kmAtual={data.km_atual}
            onEdit={() => setShowForm(true)}
          />

          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogContent onClose={() => setShowForm(false)}>
              <DialogHeader>
                <DialogTitle>Editar Moto</DialogTitle>
              </DialogHeader>
              <MotoForm
                defaultValues={data.moto}
                onSubmit={handleUpdate}
                isLoading={updateMoto.isPending}
                submitLabel="Salvar Alterações"
              />
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Cadastrar Moto</CardTitle>
            <Plus className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <MotoForm
              onSubmit={handleCreate}
              isLoading={createMoto.isPending}
              submitLabel="Cadastrar"
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
