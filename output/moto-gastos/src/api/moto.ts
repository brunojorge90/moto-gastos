import { apiClient } from './client'
import type { Moto, MotoResponse } from '@/types'

export async function getMoto(): Promise<MotoResponse> {
  const { data } = await apiClient.get<MotoResponse>('/moto')
  return data
}

export async function createMoto(payload: Omit<Moto, 'id'>): Promise<MotoResponse> {
  const { data } = await apiClient.post<MotoResponse>('/moto', payload)
  return data
}

export async function updateMoto(payload: Partial<Moto>): Promise<MotoResponse> {
  const { data } = await apiClient.put<MotoResponse>('/moto', payload)
  return data
}
