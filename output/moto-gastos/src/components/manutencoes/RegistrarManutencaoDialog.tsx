import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCreateRealizada } from '@/hooks/useManutencoes'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  tipoId: string
  tipoNome: string
  kmSugerido: number
}

function hojeISO() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function RegistrarManutencaoDialog({ open, onOpenChange, tipoId, tipoNome, kmSugerido }: Props) {
  const [data, setData] = useState(hojeISO())
  const [km, setKm] = useState(String(Math.round(kmSugerido)))
  const [valor, setValor] = useState('')
  const [observacao, setObservacao] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  const createRealizada = useCreateRealizada()

  useEffect(() => {
    if (open) {
      setData(hojeISO())
      setKm(String(Math.round(kmSugerido)))
      setValor('')
      setObservacao('')
      setErro(null)
    }
  }, [open, kmSugerido])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)

    const kmNum = parseFloat(km)
    if (!data || Number.isNaN(kmNum) || kmNum <= 0) {
      setErro('Informe data e KM válidos.')
      return
    }

    try {
      await createRealizada.mutateAsync({
        tipo_manutencao_id: tipoId,
        data_realizacao: data,
        km_no_momento: kmNum,
        valor_gasto: valor ? parseFloat(valor) : 0,
        observacao: observacao.trim() || undefined,
      })
      onOpenChange(false)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao registrar manutenção.'
      setErro(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Registrar manutenção — {tipoNome}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="data">Data realizada</Label>
            <Input
              id="data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              max={hojeISO()}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="km">KM no momento</Label>
            <Input
              id="km"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={km}
              onChange={(e) => setKm(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">Sugerido: KM atual da moto.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor">Valor gasto (R$)</Label>
            <Input
              id="valor"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0,00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="obs">Observação (opcional)</Label>
            <Textarea
              id="obs"
              rows={2}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            />
          </div>

          {erro && <p className="text-sm text-destructive">{erro}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createRealizada.isPending}>
              {createRealizada.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
