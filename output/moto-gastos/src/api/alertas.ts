import { apiClient } from './client'
import type { AlertaConfig } from '@/types'

export async function getAlertasConfig(): Promise<AlertaConfig[]> {
  const { data } = await apiClient.get<AlertaConfig[]>('/alertas/config')
  return data
}

export async function updateAlertaConfig(
  tipo_manutencao_id: string,
  payload: { km_antecedencia?: number; notificacao_ativa?: boolean }
): Promise<AlertaConfig> {
  const { data } = await apiClient.put<AlertaConfig>(
    `/alertas/config/${tipo_manutencao_id}`,
    payload
  )
  return data
}

export async function getTelegramConfig(): Promise<{ chat_id: string | null }> {
  const { data } = await apiClient.get<{ chat_id: string | null }>('/alertas/telegram')
  return data
}

export async function updateTelegramConfig(chat_id: string | null): Promise<{ chat_id: string | null }> {
  const { data } = await apiClient.put<{ chat_id: string | null }>('/alertas/telegram', { chat_id })
  return data
}

export async function testarTelegram(): Promise<{ ok: boolean }> {
  const { data } = await apiClient.post<{ ok: boolean }>('/alertas/telegram/test')
  return data
}

export async function notificarAgora(): Promise<{ enviadas: number; erros: number; totalUsuarios: number }> {
  const { data } = await apiClient.post<{ enviadas: number; erros: number; totalUsuarios: number }>(
    '/alertas/notificar-agora'
  )
  return data
}

export async function enviarRelatorioTelegram(): Promise<{ ok: boolean }> {
  const { data } = await apiClient.post<{ ok: boolean }>('/alertas/telegram/relatorio')
  return data
}
