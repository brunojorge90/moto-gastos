import { apiClient } from './client'
import type {
  ManutencaoTipo,
  ManutencaoRealizada,
  ManutencaoStatusResponse,
} from '@/types'

// Tipos
export async function getTipos(): Promise<ManutencaoTipo[]> {
  const { data } = await apiClient.get<ManutencaoTipo[]>('/manutencoes/tipos')
  return data
}

export async function createTipo(payload: { nome: string; intervalo_km: number }): Promise<ManutencaoTipo> {
  const { data } = await apiClient.post<ManutencaoTipo>('/manutencoes/tipos', payload)
  return data
}

export async function updateTipo(
  id: number,
  payload: { nome?: string; intervalo_km?: number; ativo?: boolean }
): Promise<ManutencaoTipo> {
  const { data } = await apiClient.put<ManutencaoTipo>(`/manutencoes/tipos/${id}`, payload)
  return data
}

export async function deleteTipo(id: number): Promise<void> {
  await apiClient.delete(`/manutencoes/tipos/${id}`)
}

// Status
export async function getStatus(): Promise<ManutencaoStatusResponse> {
  const { data } = await apiClient.get<ManutencaoStatusResponse>('/manutencoes/status')
  return data
}

// Realizadas
export interface GetRealizadasParams {
  limit?: number
  offset?: number
  tipo_manutencao_id?: number
}

export async function getRealizadas(params?: GetRealizadasParams): Promise<ManutencaoRealizada[]> {
  const { data } = await apiClient.get<ManutencaoRealizada[]>('/manutencoes/realizadas', { params })
  return data
}

export interface CreateRealizadaPayload {
  tipo_manutencao_id: number
  data_realizacao: string
  km_no_momento: number
  valor_gasto: number
  observacao?: string
}

export async function createRealizada(payload: CreateRealizadaPayload): Promise<ManutencaoRealizada> {
  const { data } = await apiClient.post<ManutencaoRealizada>('/manutencoes/realizadas', payload)
  return data
}

export async function deleteRealizada(id: number): Promise<void> {
  await apiClient.delete(`/manutencoes/realizadas/${id}`)
}
