import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import axios from 'axios'

// Reset modules before each test so we get fresh interceptors
beforeEach(() => {
  localStorage.clear()
  window.location.href = ''
})

aftherEach(() => {
  vi.restoreAllMocks()
})

describe('apiClient interceptors', () => {
  it('adiciona Authorization header quando token está no localStorage', async () => {
    localStorage.setItem('moto_gastos_token', 'meu-token-jwt')

    // Import dinâmico para obter instância com estado de localStorage já setado
    const { apiClient } = await import('@/api/client')

    let capturedConfig: any = null
    const interceptorId = apiClient.interceptors.request.use((config) => {
      capturedConfig = config
      return config
    })

    // Simula uma requisição mockando o adapter
    const mockAdapter = vi.fn().mockResolvedValue({
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    })
    const originalAdapter = apiClient.defaults.adapter
    apiClient.defaults.adapter = mockAdapter

    try {
      await apiClient.get('/test')
      expect(capturedConfig?.headers?.Authorization).toBe('Bearer meu-token-jwt')
    } finally {
      apiClient.defaults.adapter = originalAdapter
      apiClient.interceptors.request.eject(interceptorId)
    }
  })

  it('não adiciona Authorization header sem token', async () => {
    localStorage.removeItem('moto_gastos_token')
    const { apiClient } = await import('@/api/client')

    let capturedConfig: any = null
    const interceptorId = apiClient.interceptors.request.use((config) => {
      capturedConfig = config
      return config
    })

    const mockAdapter = vi.fn().mockResolvedValue({
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    })
    const originalAdapter = apiClient.defaults.adapter
    apiClient.defaults.adapter = mockAdapter

    try {
      await apiClient.get('/test')
      expect(capturedConfig?.headers?.Authorization).toBeUndefined()
    } finally {
      apiClient.defaults.adapter = originalAdapter
      apiClient.interceptors.request.eject(interceptorId)
    }
  })

  it('remove token e redireciona para /login em resposta 401', async () => {
    localStorage.setItem('moto_gastos_token', 'token-expirado')
    const { apiClient } = await import('@/api/client')

    const mockAdapter = vi.fn().mockRejectedValue({
      response: { status: 401, data: {} },
      isAxiosError: true,
    })
    const originalAdapter = apiClient.defaults.adapter
    apiClient.defaults.adapter = mockAdapter

    try {
      await apiClient.get('/protegido').catch(() => {})
      expect(localStorage.getItem('moto_gastos_token')).toBeNull()
      expect(window.location.href).toBe('/login')
    } finally {
      apiClient.defaults.adapter = originalAdapter
    }
  })

  it('não redireciona para outros erros (ex: 500)', async () => {
    localStorage.setItem('moto_gastos_token', 'token-valido')
    window.location.href = ''
    const { apiClient } = await import('@/api/client')

    const mockAdapter = vi.fn().mockRejectedValue({
      response: { status: 500, data: {} },
      isAxiosError: true,
    })
    const originalAdapter = apiClient.defaults.adapter
    apiClient.defaults.adapter = mockAdapter

    try {
      await apiClient.get('/server-error').catch(() => {})
      expect(localStorage.getItem('moto_gastos_token')).toBe('token-valido')
      expect(window.location.href).toBe('')
    } finally {
      apiClient.defaults.adapter = originalAdapter
    }
  })
})
