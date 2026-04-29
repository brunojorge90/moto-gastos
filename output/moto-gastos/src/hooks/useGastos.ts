import { useQuery } from '@tanstack/react-query'
import { getResumo } from '@/api/gastos'
import { QUERY_KEYS } from '@/lib/constants'

export function useGastosResumo(periodo = 12) {
  return useQuery({
    queryKey: QUERY_KEYS.gastosResumo(periodo),
    queryFn: () => getResumo(periodo),
  })
}
