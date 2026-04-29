import { Bell, BellOff } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import type { AlertaConfig } from '@/types'
import { formatKm } from '@/lib/utils'

interface AlertasConfigProps {
  configs: AlertaConfig[]
  onUpdate: (tipo_manutencao_id: number, payload: { km_antecedencia?: number; notificacao_ativa?: boolean }) => void
  isUpdating?: boolean
}

export function AlertasConfigComponent({ configs, onUpdate, isUpdating }: AlertasConfigProps) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [kmValue, setKmValue] = useState<number>(0)

  const startEdit = (config: AlertaConfig) => {
    setEditingId(config.tipo_manutencao_id)
    setKmValue(config.km_antecedencia)
  }

  const saveEdit = (tipo_manutencao_id: number) => {
    onUpdate(tipo_manutencao_id, { km_antecedencia: kmValue })
    setEditingId(null)
  }

  return (
    <div className="space-y-3">
      {configs.map((config) => (
        <Card key={config.tipo_manutencao_id}>
          <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4">
            <div className="flex-1">
              <p className="font-medium">
                {config.tipo?.nome ?? `Tipo ${config.tipo_manutencao_id}`}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Antecedência: {formatKm(config.km_antecedencia)}
              </p>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              {editingId === config.tipo_manutencao_id ? (
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Antecedência (km)</Label>
                  <Input
                    type="number"
                    value={kmValue}
                    onChange={(e) => setKmValue(Number(e.target.value))}
                    className="w-28"
                  />
                  <Button size="sm" onClick={() => saveEdit(config.tipo_manutencao_id)} disabled={isUpdating}>
                    Salvar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => startEdit(config)}>
                  Editar km
                </Button>
              )}

              <div className="flex items-center gap-2">
                {config.notificacao_ativa ? (
                  <Bell className="h-4 w-4 text-primary" />
                ) : (
                  <BellOff className="h-4 w-4 text-muted-foreground" />
                )}
                <Switch
                  checked={config.notificacao_ativa}
                  onCheckedChange={(checked) =>
                    onUpdate(config.tipo_manutencao_id, { notificacao_ativa: checked })
                  }
                  disabled={isUpdating}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
