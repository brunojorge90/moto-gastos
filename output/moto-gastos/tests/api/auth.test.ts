import { describe, it, expect, vi, beforeEach } from 'vitest'
import { login, register } from '@/api/auth'

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

const mockPost = vi.mocked(apiClient.post)

const mockUser = { id: 1, email: 'user@test.com', nome: 'Test User' }
const mockAuthResponse = { token: 'jwt-token-abc', user: mockUser }

beforeEach(() => {
  vi.clearAllMocks()
})

describe('login', () => {
  it('chama POST /auth/login com email e senha', async () => {
    mockPost.mockResolvedValueOnce({ data: mockAuthResponse })

    const result = await login('user@test.com', 'senha123')

    expect(mockPost).toHaveBeenCalledOnce()
    expect(mockPost).toHaveBeenCalledWith('/auth/login', {
      email: 'user@test.com',
      password: 'senha123',
    })
    expect(result).toEqual(mockAuthResponse)
  })

  it('retorna token e user corretamente', async () => {
    mockPost.mockResolvedValueOnce({ data: mockAuthResponse })

    const result = await login('user@test.com', 'senha123')

    expect(result.token).toBe('jwt-token-abc')
    expect(result.user.id).toBe(1)
    expect(result.user.email).toBe('user@test.com')
  })

  it('propaga erro quando a requisição falha', async () => {
    const apiError = new Error('Invalid credentials')
    mockPost.mockRejectedValueOnce(apiError)

    await expect(login('wrong@test.com', 'senhaerrada')).rejects.toThrow('Invalid credentials')
  })

  it('propaga erro 401 do servidor', async () => {
    const axiosError = { response: { status: 401, data: { message: 'Unauthorized' } } }
    mockPost.mockRejectedValueOnce(axiosError)

    await expect(login('user@test.com', 'senha-errada')).rejects.toEqual(axiosError)
  })
})

describe('register', () => {
  it('chama POST /auth/register com email e senha', async () => {
    mockPost.mockResolvedValueOnce({ data: mockAuthResponse })

    const result = await register('novo@test.com', 'senha456')

    expect(mockPost).toHaveBeenCalledOnce()
    expect(mockPost).toHaveBeenCalledWith('/auth/register', {
      email: 'novo@test.com',
      password: 'senha456',
    })
    expect(result).toEqual(mockAuthResponse)
  })

  it('retorna AuthResponse após registro bem-sucedido', async () => {
    const newUserResponse = {
      token: 'novo-token-xyz',
      user: { id: 2, email: 'novo@test.com' },
    }
    mockPost.mockResolvedValueOnce({ data: newUserResponse })

    const result = await register('novo@test.com', 'senha456')

    expect(result.token).toBe('novo-token-xyz')
    expect(result.user.email).toBe('novo@test.com')
  })

  it('propaga erro quando registro falha', async () => {
    mockPost.mockRejectedValueOnce(new Error('Email já cadastrado'))

    await expect(register('existente@test.com', 'senha789')).rejects.toThrow('Email já cadastrado')
  })
})
