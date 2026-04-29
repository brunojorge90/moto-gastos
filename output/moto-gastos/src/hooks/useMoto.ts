import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMoto, createMoto, updateMoto } from '@/api/moto'
import { QUERY_KEYS } from '@/lib/constants'
import type { Moto } from '@/types'

export function useMoto() {
  return useQuery({
    queryKey: QUERY_KEYS.moto,
    queryFn: getMoto,
  })
}

export function useCreateMoto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createMoto,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.moto })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.manutencoesStatus })
    },
  })
}

export function useUpdateMoto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Moto>) => updateMoto(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.moto })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.manutencoesStatus })
    },
  })
}
