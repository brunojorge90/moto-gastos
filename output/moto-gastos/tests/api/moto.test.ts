import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getMoto, createMoto, updateMoto } from '@/api/moto'

vi.mock('@/api/client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
    defaults: { headers: {} },
  },
}))

import { apiClient } from '@/api/client'

const mockGet = vi.mocked(apiClient.get)
const mockPost = vi.mocked(apiClient.post)
const mockPut = vi.mocked(apiClient.put)

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

describe('getMoto', () => {
  it('faz GET /moto e retorna MotoResponse', async () => {
    mockGet.mockResolvedValueOnce({ data: mockMotoResponse })

    const result = await getMoto()

    expect(mockGet).toHaveBeenCalledOnce()
    expect(mockGet).toHaveBeenCalledWith('/moto')
    expect(result).toEqual(mockMotoResponse)
  })

  it('retorna moto com km_atual correto', async () => {
    mockGet.mockResolvedValueOnce({ data: mockMotoResponse })

    const result = await getMoto()

    expect(result.moto.apelido).toBe('Fazer 250')
    expect(result.km_atual).toBe(10800)
  })

  it('propaga erro de rede', async () => {
    mockGet.mockRejectedValueOnce(new Error('Network Error'))

    await expect(getMoto()).rejects.toThrow('Network Error')
  })
})

describe('createMoto', () => {
  const payload = {
    apelido: 'Nova Moto',
    modelo: 'Honda CB 500',
    ano: 2023,
    km_inicial: 500,
    media_diaria_km: 25,
    data_referencia: '2024-03-01',
  }

  it('faz POST /moto com payload correto', async () => {
    mockPost.mockResolvedValueOnce({ data: { moto: { id: 2, ...payload }, km_atual: 500 } })

    await createMoto(payload)

    expect(mockPost).toHaveBeenCalledOnce()
    expect(mockPost).toHaveBeenCalledWith('/moto', payload)
  })

  it('retorna MotoResponse após criação', async () => {
    const response = { moto: { id: 2, ...payload }, km_atual: 500 }
    mockPost.mockResolvedValueOnce({ data: response })

    const result = await createMoto(payload)

    expect(result.moto.id).toBe(2)
    expect(result.moto.apelido).toBe('Nova Moto')
  })

  it('propaga erro ao criar moto', async () => {
    mockPost.mockRejectedValueOnce(new Error('Validation error'))

    await expect(createMoto(payload)).rejects.toThrow('Validation error')
  })
})

describe('updateMoto', () => {
  it('faz PUT /moto com payload parcial', async () => {
    const partialPayload = { id: 1, km_inicial: 1000 }
    mockPut.mockResolvedValueOnce({ data: { moto: { ...mockMoto, km_inicial: 1000 }, km_atual: 11800 } })

    await updateMoto(partialPayload)

    expect(mockPut).toHaveBeenCalledOnce()
    expect(mockPut).toHaveBeenCalledWith('/moto', partialPayload)
  })

  it('retorna MotoResponse atualizado', async () => {
    const updated = { moto: { ...mockMoto, apelido: 'Fazer Azul' }, km_atual: 12000 }
    mockPut.mockResolvedValueOnce({ data: updated })

    const result = await updateMoto({ id: 1, apelido: 'Fazer Azul' })

    expect(result.moto.apelido).toBe('Fazer Azul')
  })

  it('propaga erro ao atualizar', async () => {
    mockPut.mockRejectedValueOnce(new Error('Server error'))

    await expect(updateMoto({ id: 1 })).rejects.toThrow('Server error')
  })
})
