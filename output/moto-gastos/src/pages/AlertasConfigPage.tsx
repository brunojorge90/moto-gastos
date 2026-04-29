import { Spinner } from '@/components/ui/spinner'
import { AlertasConfigComponent } from '@/components/alertas/AlertasConfig'
import { TelegramConfig } from '@/components/alertas/TelegramConfig'
import { useAlertasConfig, useUpdateAlertaConfig } from '@/hooks/useAlertas'

export function AlertasConfigPage() {
  const { data: configs, isLoading } = useAlertasConfig()
  const updateConfig = useUpdateAlertaConfig()

  return (
    <div className="space-y-6 max-w-2xl">
      <TelegramConfig />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : !configs || configs.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          Nenhuma configuração de alerta disponível. Cadastre tipos de manutenção primeiro.
        </p>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Configure a antecedência em km para alertas e ative/desative notificações por tipo.
          </p>
          <AlertasConfigComponent
            configs={configs}
            onUpdate={(tipo_manutencao_id, payload) =>
              updateConfig.mutate({ tipo_manutencao_id, payload })
            }
            isUpdating={updateConfig.isPending}
          />
        </div>
      )}
    </div>
  )
}
