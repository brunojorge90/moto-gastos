import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useMoto, useCreateMoto, useUpdateMoto } from '@/hooks/useMoto'

vi.mock('@/api/moto', () => ({
  getMoto: vi.fn(),
  createMoto: vi.fn(),
  updateMoto: vi.fn(),
}))

import { getMoto, createMoto, updateMoto } from '@/api/moto'

const mockGetMoto = vi.mocked(getMoto)
const mockCreateMoto = vi.mocked(createMoto)
const mockUpdateMoto = vi.mocked(updateMoto)

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

const mockMoto = {
  id: 1,
  apelido: 'Fazer 250',
  modelo: 'Yamaha Fazer 250',
  ano: 2022,
  km_inicial: 0,
  media_diaria_km: 30,
  data_referencia: '2024-01-01',
}

const mockMotoResponse = { moto: mockMoto, km_atual: 10800 }

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useMoto', () => {
  it('retorna dados da moto quando query tem sucesso', async () => {
    mockGetMoto.mockResolvedValueOnce(mockMotoResponse)

    const { result } = renderHook(() => useMoto(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockMotoResponse)
    expect(mockGetMoto).toHaveBeenCalledOnce()
  })

  it('inicia em estado de loading', () => {
    mockGetMoto.mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useMoto(), { wrapper: createWrapper() })

    expect(result.current.isLoading).toBe(true)
  })

  it('reporta erro quando query falha', async () => {
    mockGetMoto.mockRejectedValueOnce(new Error('API Error'))

    const { result } = renderHook(() => useMoto(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBeTruthy()
  })
})

describe('useCreateMoto', () => {
  it('chama createMoto e invalida queries ao ter sucesso', async () => {
    mockCreateMoto.mockResolvedValueOnce(mockMotoResponse)

    const { result } = renderHook(() => useCreateMoto(), { wrapper: createWrapper() })

    const payload = {
      apelido: 'Nova Moto',
      modelo: 'Honda CB',
      ano: 2023,
      km_inicial: 0,
      media_diaria_km: 20,
      data_referencia: '2024-01-01',
    }

    await result.current.mutateAsync(payload)

    expect(mockCreateMoto).toHaveBeenCalledWith(payload)
  })

  it('reporta erro quando mutação falha', async () => {
    mockCreateMoto.mockRejectedValueOnce(new Error('Create failed'))

    const { result } = renderHook(() => useCreateMoto(), { wrapper: createWrapper() })

    await expect(
      result.current.mutateAsync({
        apelido: 'Moto',
        modelo: 'Modelo',
        ano: 2023,
        km_inicial: 0,
        media_diaria_km: 10,
        data_referencia: '2024-01-01',
      })
    ).rejects.toThrow('Create failed')
  })
})

describe('useUpdateMoto', () => {
  it('chama updateMoto com payload parcial', async () => {
    mockUpdateMoto.mockResolvedValueOnce(mockMotoResponse)

    const { result } = renderHook(() => useUpdateMoto(), { wrapper: createWrapper() })

    await result.current.mutateAsync({ id: 1, apelido: 'Fazer Azul' })

    expect(mockUpdateMoto).toHaveBeenCalledWith({ id: 1, apelido: 'Fazer Azul' })
  })

  it('reporta erro quando atualização falha', async () => {
    mockUpdateMoto.mockRejectedValueOnce(new Error('Update failed'))

    const { result } = renderHook(() => useUpdateMoto(), { wrapper: createWrapper() })

    await expect(result.current.mutateAsync({ id: 1 })).rejects.toThrow('Update failed')
  })
})
