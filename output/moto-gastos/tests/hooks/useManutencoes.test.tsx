import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import {
  useManutencoesTipos,
  useCreateTipo,
  useUpdateTipo,
  useDeleteTipo,
  useManutencoesStatus,
  useManutencoesRealizadas,
  useCreateRealizada,
  useDeleteRealizada,
} from '@/hooks/useManutencoes'

vi.mock('@/api/manutencoes', () => ({
  getTipos: vi.fn(),
  createTipo: vi.fn(),
  updateTipo: vi.fn(),
  deleteTipo: vi.fn(),
  getStatus: vi.fn(),
  getRealizadas: vi.fn(),
  createRealizada: vi.fn(),
  deleteRealizada: vi.fn(),
}))

import {
  getTipos,
  createTipo,
  updateTipo,
  deleteTipo,
  getStatus,
  getRealizadas,
  createRealizada,
  deleteRealizada,
} from '@/api/manutencoes'

const mockGetTipos = vi.mocked(getTipos)
const mockCreateTipo = vi.mocked(createTipo)
const mockUpdateTipo = vi.mocked(updateTipo)
const mockDeleteTipo = vi.mocked(deleteTipo)
const mockGetStatus = vi.mocked(getStatus)
const mockGetRealizadas = vi.mocked(getRealizadas)
const mockCreateRealizada = vi.mocked(createRealizada)
const mockDeleteRealizada = vi.mocked(deleteRealizada)

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
}

const mockTipo = { id: 1, nome: 'Óleo do Motor', intervalo_km: 3000, ativo: true }
const mockRealizada = {
  id: 10,
  tipo_manutencao_id: 1,
  data_realizacao: '2024-03-01',
  km_no_momento: 9000,
  valor_gasto: 85.0,
}
const mockStatusResponse = {
  moto: { id: 1, apelido: 'Fazer', modelo: 'Fazer 250', ano: 2022, km_inicial: 0, media_diaria_km: 30, data_referencia: '2024-01-01' },
  km_atual: 10800,
  statusList: [
    {
      tipo: mockTipo,
      ultimaManutencao: mockRealizada,
      km_proxima: 12000,
      km_restante: 1200,
      data_estimada: '2024-07-01',
      alerta_ativo: false,
      vencida: false,
      km_antecedencia: 300,
      notificacao_ativa: true,
    },
  ],
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useManutencoesTipos', () => {
  it('retorna lista de tipos quando query tem sucesso', async () => {
    mockGetTipos.mockResolvedValueOnce([mockTipo])

    const { result } = renderHook(() => useManutencoesTipos(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([mockTipo])
  })

  it('reporta erro quando query falha', async () => {
    mockGetTipos.mockRejectedValueOnce(new Error('API Error'))

    const { result } = renderHook(() => useManutencoesTipos(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useCreateTipo', () => {
  it('chama createTipo com payload correto', async () => {
    mockCreateTipo.mockResolvedValueOnce(mockTipo)

    const { result } = renderHook(() => useCreateTipo(), { wrapper: createWrapper() })

    await result.current.mutateAsync({ nome: 'Óleo do Motor', intervalo_km: 3000 })

    expect(mockCreateTipo).toHaveBeenCalledWith({ nome: 'Óleo do Motor', intervalo_km: 3000 })
  })

  it('reporta erro quando criação falha', async () => {
    mockCreateTipo.mockRejectedValueOnce(new Error('Create failed'))

    const { result } = renderHook(() => useCreateTipo(), { wrapper: createWrapper() })

    await expect(result.current.mutateAsync({ nome: '', intervalo_km: 1000 })).rejects.toThrow('Create failed')
  })
})

describe('useUpdateTipo', () => {
  it('chama updateTipo com id e payload', async () => {
    mockUpdateTipo.mockResolvedValueOnce({ ...mockTipo, nome: 'Novo Nome' })

    const { result } = renderHook(() => useUpdateTipo(), { wrapper: createWrapper() })

    await result.current.mutateAsync({ id: 1, payload: { nome: 'Novo Nome' } })

    expect(mockUpdateTipo).toHaveBeenCalledWith(1, { nome: 'Novo Nome' })
  })
})

describe('useDeleteTipo', () => {
  it('chama deleteTipo com id correto', async () => {
    mockDeleteTipo.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useDeleteTipo(), { wrapper: createWrapper() })

    await result.current.mutateAsync(1)

    expect(mockDeleteTipo).toHaveBeenCalledWith(1)
  })

  it('reporta erro quando deleção falha', async () => {
    mockDeleteTipo.mockRejectedValueOnce(new Error('Delete failed'))

    const { result } = renderHook(() => useDeleteTipo(), { wrapper: createWrapper() })

    await expect(result.current.mutateAsync(999)).rejects.toThrow('Delete failed')
  })
})

describe('useManutencoesStatus', () => {
  it('retorna status quando query tem sucesso', async () => {
    mockGetStatus.mockResolvedValueOnce(mockStatusResponse)

    const { result } = renderHook(() => useManutencoesStatus(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockStatusResponse)
    expect(result.current.data?.statusList).toHaveLength(1)
  })
})

describe('useManutencoesRealizadas', () => {
  it('busca realizadas sem filtros', async () => {
    mockGetRealizadas.mockResolvedValueOnce([mockRealizada])

    const { result } = renderHook(() => useManutencoesRealizadas(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([mockRealizada])
    expect(mockGetRealizadas).toHaveBeenCalledWith(undefined)
  })

  it('passa filtros para a api', async () => {
    mockGetRealizadas.mockResolvedValueOnce([mockRealizada])
    const filtros = { limit: 5, tipo_manutencao_id: 1 }

    const { result } = renderHook(() => useManutencoesRealizadas(filtros), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockGetRealizadas).toHaveBeenCalledWith(filtros)
  })
})

describe('useCreateRealizada', () => {
  it('chama createRealizada com payload correto', async () => {
    mockCreateRealizada.mockResolvedValueOnce(mockRealizada)

    const { result } = renderHook(() => useCreateRealizada(), { wrapper: createWrapper() })

    const payload = {
      tipo_manutencao_id: 1,
      data_realizacao: '2024-05-20',
      km_no_momento: 12000,
      valor_gasto: 90.0,
    }

    await result.current.mutateAsync(payload)

    expect(mockCreateRealizada).toHaveBeenCalledWith(payload)
  })
})

describe('useDeleteRealizada', () => {
  it('chama deleteRealizada com id correto', async () => {
    mockDeleteRealizada.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useDeleteRealizada(), { wrapper: createWrapper() })

    await result.current.mutateAsync(10)

    expect(mockDeleteRealizada).toHaveBeenCalledWith(10)
  })
})
