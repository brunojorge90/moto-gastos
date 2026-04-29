import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTipos,
  createTipo,
  updateTipo,
  deleteTipo,
  getStatus,
  getRealizadas,
  createRealizada,
  deleteRealizada,
  type GetRealizadasParams,
  type CreateRealizadaPayload,
} from '@/api/manutencoes'
import { QUERY_KEYS } from '@/lib/constants'

export function useManutencoesTipos() {
  return useQuery({
    queryKey: QUERY_KEYS.manutencoesTipos,
    queryFn: getTipos,
  })
}

export function useCreateTipo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createTipo,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.manutencoesTipos })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.manutencoesStatus })
    },
  })
}

export function useUpdateTipo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { nome?: string; intervalo_km?: number; ativo?: boolean } }) =>
      updateTipo(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.manutencoesTipos })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.manutencoesStatus })
    },
  })
}

export function useDeleteTipo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTipo(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.manutencoesTipos })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.manutencoesStatus })
    },
  })
}

export function useManutencoesStatus() {
  return useQuery({
    queryKey: QUERY_KEYS.manutencoesStatus,
    queryFn: getStatus,
  })
}

export function useManutencoesRealizadas(filtros?: GetRealizadasParams) {
  return useQuery({
    queryKey: QUERY_KEYS.manutencoesRealizadas(filtros as Record<string, unknown>),
    queryFn: () => getRealizadas(filtros),
  })
}

export function useCreateRealizada() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateRealizadaPayload) => createRealizada(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['manutencoes', 'realizadas'] })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.manutencoesStatus })
      qc.invalidateQueries({ queryKey: ['gastos', 'resumo'] })
    },
  })
}

export function useDeleteRealizada() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteRealizada(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['manutencoes', 'realizadas'] })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.manutencoesStatus })
      qc.invalidateQueries({ queryKey: ['gastos', 'resumo'] })
    },
  })
}
