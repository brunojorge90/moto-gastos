import { describe, it, expect, vi, beforeEach } from 'vitest'
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
const mockDelete = vi.mocked(apiClient.delete)

const mockTipo = { id: 1, nome: 'Óleo do Motor', intervalo_km: 3000, ativo: true }
const mockRealizada = {
  id: 10,
  tipo_manutencao_id: 1,
  data_realizacao: '2024-03-01',
  km_no_momento: 9000,
  valor_gasto: 85.0,
  observacao: 'Troca rotineira',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getTipos', () => {
  it('faz GET /manutencoes/tipos', async () => {
    mockGet.mockResolvedValueOnce({ data: [mockTipo] })

    const result = await getTipos()

    expect(mockGet).toHaveBeenCalledWith('/manutencoes/tipos')
    expect(result).toEqual([mockTipo])
  })

  it('retorna array vazio quando não há tipos', async () => {
    mockGet.mockResolvedValueOnce({ data: [] })

    const result = await getTipos()

    expect(result).toEqual([])
  })

  it('propaga erro de rede', async () => {
    mockGet.mockRejectedValueOnce(new Error('Network Error'))

    await expect(getTipos()).rejects.toThrow('Network Error')
  })
})

describe('createTipo', () => {
  it('faz POST /manutencoes/tipos com payload', async () => {
    mockPost.mockResolvedValueOnce({ data: mockTipo })

    const result = await createTipo({ nome: 'Óleo do Motor', intervalo_km: 3000 })

    expect(mockPost).toHaveBeenCalledWith('/manutencoes/tipos', { nome: 'Óleo do Motor', intervalo_km: 3000 })
    expect(result).toEqual(mockTipo)
  })

  it('propaga erro de validação', async () => {
    mockPost.mockRejectedValueOnce({ response: { status: 422, data: { message: 'nome é obrigatório' } } })

    await expect(createTipo({ nome: '', intervalo_km: 1000 })).rejects.toBeTruthy()
  })
})

describe('updateTipo', () => {
  it('faz PUT /manutencoes/tipos/:id', async () => {
    const updated = { ...mockTipo, nome: 'Óleo Sintetico', intervalo_km: 5000 }
    mockPut.mockResolvedValueOnce({ data: updated })

    const result = await updateTipo(1, { nome: 'Óleo Sintetico', intervalo_km: 5000 })

    expect(mockPut).toHaveBeenCalledWith('/manutencoes/tipos/1', { nome: 'Óleo Sintetico', intervalo_km: 5000 })
    expect(result.nome).toBe('Óleo Sintetico')
  })

  it('aceita atualização parcial de campos', async () => {
    mockPut.mockResolvedValueOnce({ data: { ...mockTipo, ativo: false } })

    const result = await updateTipo(1, { ativo: false })

    expect(mockPut).toHaveBeenCalledWith('/manutencoes/tipos/1', { ativo: false })
    expect(result.ativo).toBe(false)
  })
})

describe('deleteTipo', () => {
  it('faz DELETE /manutencoes/tipos/:id', async () => {
    mockDelete.mockResolvedValueOnce({ data: undefined })

    await deleteTipo(1)

    expect(mockDelete).toHaveBeenCalledWith('/manutencoes/tipos/1')
  })

  it('propaga erro ao deletar', async () => {
    mockDelete.mockRejectedValueOnce(new Error('Not found'))

    await expect(deleteTipo(999)).rejects.toThrow('Not found')
  })
})

describe('getStatus', () => {
  it('faz GET /manutencoes/status', async () => {
    const mockStatusResponse = {
      moto: { id: 1, apelido: 'Fazer', modelo: 'Fazer 250', ano: 2022, km_inicial: 0, media_diaria_km: 30, data_referencia: '2024-01-01' },
      km_atual: 10800,
      statusList: [],
    }
    mockGet.mockResolvedValueOnce({ data: mockStatusResponse })

    const result = await getStatus()

    expect(mockGet).toHaveBeenCalledWith('/manutencoes/status')
    expect(result).toEqual(mockStatusResponse)
  })
})

describe('getRealizadas', () => {
  it('faz GET /manutencoes/realizadas sem params', async () => {
    mockGet.mockResolvedValueOnce({ data: [mockRealizada] })

    const result = await getRealizadas()

    expect(mockGet).toHaveBeenCalledWith('/manutencoes/realizadas', { params: undefined })
    expect(result).toEqual([mockRealizada])
  })

  it('passa filtros como query params', async () => {
    mockGet.mockResolvedValueOnce({ data: [mockRealizada] })

    await getRealizadas({ limit: 10, offset: 0, tipo_manutencao_id: 1 })

    expect(mockGet).toHaveBeenCalledWith('/manutencoes/realizadas', {
      params: { limit: 10, offset: 0, tipo_manutencao_id: 1 },
    })
  })
})

describe('createRealizada', () => {
  const payload = {
    tipo_manutencao_id: 1,
    data_realizacao: '2024-05-20',
    km_no_momento: 12000,
    valor_gasto: 90.0,
    observacao: 'Troca de óleo',
  }

  it('faz POST /manutencoes/realizadas com payload completo', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 11, ...payload } })

    const result = await createRealizada(payload)

    expect(mockPost).toHaveBeenCalledWith('/manutencoes/realizadas', payload)
    expect(result.id).toBe(11)
  })

  it('payload sem observacao é aceito', async () => {
    const payloadSemObs = { tipo_manutencao_id: 1, data_realizacao: '2024-05-20', km_no_momento: 12000, valor_gasto: 90.0 }
    mockPost.mockResolvedValueOnce({ data: { id: 12, ...payloadSemObs } })

    const result = await createRealizada(payloadSemObs)

    expect(result.observacao).toBeUndefined()
  })
})

describe('deleteRealizada', () => {
  it('faz DELETE /manutencoes/realizadas/:id', async () => {
    mockDelete.mockResolvedValueOnce({ data: undefined })

    await deleteRealizada(10)

    expect(mockDelete).toHaveBeenCalledWith('/manutencoes/realizadas/10')
  })

  it('propaga erro ao deletar', async () => {
    mockDelete.mockRejectedValueOnce(new Error('Not found'))

    await expect(deleteRealizada(999)).rejects.toThrow('Not found')
  })
})
