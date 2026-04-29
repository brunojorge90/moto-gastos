export const TOKEN_KEY = 'moto_gastos_token'
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001'

export const QUERY_KEYS = {
  moto: ['moto'] as const,
  manutencoesTipos: ['manutencoes', 'tipos'] as const,
  manutencoesStatus: ['manutencoes', 'status'] as const,
  manutencoesRealizadas: (filtros?: Record<string, unknown>) =>
    filtros ? (['manutencoes', 'realizadas', filtros] as const) : (['manutencoes', 'realizadas'] as const),
  gastosResumo: (periodo: number) => ['gastos', 'resumo', periodo] as const,
  alertasConfig: ['alertas', 'config'] as const,
}
