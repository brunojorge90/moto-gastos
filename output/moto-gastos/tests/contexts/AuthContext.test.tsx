import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider, AuthContext } from '@/contexts/AuthContext'
import { useContext } from 'react'
import React from 'react'

vi.mock('@/api/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
}))

import { login as apiLogin, register as apiRegister } from '@/api/auth'

const mockApiLogin = vi.mocked(apiLogin)
const mockApiRegister = vi.mocked(apiRegister)

const TOKEN_KEY = 'moto_gastos_token'

const mockUser = { id: 1, email: 'user@test.com', nome: 'Test User' }
const mockAuthResponse = { token: 'jwt-test-token', user: mockUser }

function TestConsumer() {
  const ctx = useContext(AuthContext)
  if (!ctx) return <div>no context</div>
  return (
    <div>
      <span data-testid="isAuthenticated">{String(ctx.isAuthenticated)}</span>
      <span data-testid="isLoading">{String(ctx.isLoading)}</span>
      <span data-testid="token">{ctx.token ?? 'null'}</span>
      <span data-testid="userEmail">{ctx.user?.email ?? 'null'}</span>
      <button onClick={() => ctx.login('user@test.com', 'senha123')}>Login</button>
      <button onClick={() => ctx.register('novo@test.com', 'senha456')}>Register</button>
      <button onClick={() => ctx.logout()}>Logout</button>
    </div>
  )
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

describe('AuthProvider', () => {
  it('renderiza filhos corretamente', () => {
    render(
      <AuthProvider>
        <div data-testid="child">child content</div>
      </AuthProvider>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('inicia não autenticado quando localStorage está vazio', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('isLoading').textContent).toBe('false')
    })

    expect(screen.getByTestId('isAuthenticated').textContent).toBe('false')
    expect(screen.getByTestId('token').textContent).toBe('null')
  })

  it('inicia autenticado quando há token no localStorage', async () => {
    localStorage.setItem(TOKEN_KEY, 'token-existente')

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('isLoading').textContent).toBe('false')
    })

    expect(screen.getByTestId('isAuthenticated').textContent).toBe('true')
    expect(screen.getByTestId('token').textContent).toBe('token-existente')
  })

  it('login salva token no localStorage e atualiza estado', async () => {
    mockApiLogin.mockResolvedValueOnce(mockAuthResponse)

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await act(async () => {
      screen.getByText('Login').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('true')
    })

    expect(localStorage.getItem(TOKEN_KEY)).toBe('jwt-test-token')
    expect(screen.getByTestId('token').textContent).toBe('jwt-test-token')
    expect(screen.getByTestId('userEmail').textContent).toBe('user@test.com')
  })

  it('login chama apiLogin com email e senha corretos', async () => {
    mockApiLogin.mockResolvedValueOnce(mockAuthResponse)

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await act(async () => {
      screen.getByText('Login').click()
    })

    expect(mockApiLogin).toHaveBeenCalledWith('user@test.com', 'senha123')
  })

  it('register salva token no localStorage e atualiza estado', async () => {
    const newUserResponse = { token: 'novo-token', user: { id: 2, email: 'novo@test.com' } }
    mockApiRegister.mockResolvedValueOnce(newUserResponse)

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await act(async () => {
      screen.getByText('Register').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('true')
    })

    expect(localStorage.getItem(TOKEN_KEY)).toBe('novo-token')
    expect(mockApiRegister).toHaveBeenCalledWith('novo@test.com', 'senha456')
  })

  it('logout limpa token do localStorage e reseta estado', async () => {
    localStorage.setItem(TOKEN_KEY, 'token-existente')

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('true')
    })

    await act(async () => {
      screen.getByText('Logout').click()
    })

    expect(screen.getByTestId('isAuthenticated').textContent).toBe('false')
    expect(screen.getByTestId('token').textContent).toBe('null')
    expect(screen.getByTestId('userEmail').textContent).toBe('null')
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
  })

  it('isLoading começa true e vira false após useEffect', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('isLoading').textContent).toBe('false')
    })
  })
})

describe('AuthContext sem Provider', () => {
  it('retorna null fora do Provider', () => {
    let capturedCtx: any = undefined
    function Spy() {
      capturedCtx = useContext(AuthContext)
      return null
    }
    render(<Spy />)
    expect(capturedCtx).toBeNull()
  })
})
