import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAlertasConfig,
  updateAlertaConfig,
  getTelegramConfig,
  updateTelegramConfig,
  testarTelegram,
  notificarAgora,
} from '@/api/alertas'
import { QUERY_KEYS } from '@/lib/constants'

export function useAlertasConfig() {
  return useQuery({
    queryKey: QUERY_KEYS.alertasConfig,
    queryFn: getAlertasConfig,
  })
}

export function useUpdateAlertaConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      tipo_manutencao_id,
      payload,
    }: {
      tipo_manutencao_id: string
      payload: { km_antecedencia?: number; notificacao_ativa?: boolean }
    }) => updateAlertaConfig(tipo_manutencao_id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.alertasConfig })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.manutencoesStatus })
    },
  })
}

export function useTelegramConfig() {
  return useQuery({
    queryKey: ['alertas', 'telegram'] as const,
    queryFn: getTelegramConfig,
  })
}

export function useUpdateTelegramConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (chat_id: string | null) => updateTelegramConfig(chat_id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alertas', 'telegram'] })
    },
  })
}

export function useTestarTelegram() {
  return useMutation({ mutationFn: testarTelegram })
}

export function useNotificarAgora() {
  return useMutation({ mutationFn: notificarAgora })
}
