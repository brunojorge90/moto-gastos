import { apiClient } from './client'
import type { GastosResumoResponse } from '@/types'

export async function getResumo(periodo = 12): Promise<GastosResumoResponse> {
  const { data } = await apiClient.get<GastosResumoResponse>('/gastos/resumo', {
    params: { periodo },
  })
  return data
}
