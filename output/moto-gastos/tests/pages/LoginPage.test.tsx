import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import React from 'react'
import { LoginPage } from '@/pages/LoginPage'

const mockLogin = vi.fn()
const mockNavigate = vi.fn()

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ login: mockLogin }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LoginPage — renderização', () => {
  it('renderiza título Moto Gastos', () => {
    renderLoginPage()
    expect(screen.getByText('Moto Gastos')).toBeInTheDocument()
  })

  it('renderiza campo de e-mail', () => {
    renderLoginPage()
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
  })

  it('renderiza campo de senha', () => {
    renderLoginPage()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
  })

  it('renderiza botão de entrar', () => {
    renderLoginPage()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('renderiza link para criar conta', () => {
    renderLoginPage()
    expect(screen.getByText('Criar conta')).toBeInTheDocument()
  })

  it('não exibe mensagem de erro inicialmente', () => {
    renderLoginPage()
    expect(screen.queryByText('E-mail ou senha inválidos.')).not.toBeInTheDocument()
  })
})

describe('LoginPage — validação de formulário', () => {
  it('exibe erro de e-mail inválido ao submeter sem preencher', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByText('E-mail inválido')).toBeInTheDocument()
    })
  })

  it('exibe erro de senha curta ao submeter com senha < 6 chars', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText('E-mail'), 'user@test.com')
    await user.type(screen.getByLabelText('Senha'), '123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByText('Senha deve ter no mínimo 6 caracteres')).toBeInTheDocument()
    })
  })

  it('não exibe erros com dados válidos', async () => {
    mockLogin.mockResolvedValueOnce(undefined)
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText('E-mail'), 'user@test.com')
    await user.type(screen.getByLabelText('Senha'), 'senha123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.queryByText('E-mail inválido')).not.toBeInTheDocument()
      expect(screen.queryByText('Senha deve ter no mínimo 6 caracteres')).not.toBeInTheDocument()
    })
  })
})

describe('LoginPage — fluxo de submissão', () => {
  it('chama login com email e senha corretos', async () => {
    mockLogin.mockResolvedValueOnce(undefined)
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText('E-mail'), 'user@test.com')
    await user.type(screen.getByLabelText('Senha'), 'senha123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'senha123')
    })
  })

  it('navega para /dashboard após login bem-sucedido', async () => {
    mockLogin.mockResolvedValueOnce(undefined)
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText('E-mail'), 'user@test.com')
    await user.type(screen.getByLabelText('Senha'), 'senha123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('exibe mensagem de erro quando login falha', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'))
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText('E-mail'), 'user@test.com')
    await user.type(screen.getByLabelText('Senha'), 'senha-errada')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByText('E-mail ou senha inválidos.')).toBeInTheDocument()
    })
  })

  it('não navega quando login falha', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'))
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText('E-mail'), 'user@test.com')
    await user.type(screen.getByLabelText('Senha'), 'senha-errada')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  it('mostra "Entrando..." durante o carregamento', async () => {
    let resolveLogin: () => void
    const loginPromise = new Promise<void>((resolve) => {
      resolveLogin = resolve
    })
    mockLogin.mockReturnValueOnce(loginPromise)
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText('E-mail'), 'user@test.com')
    await user.type(screen.getByLabelText('Senha'), 'senha123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Entrando...' })).toBeInTheDocument()
    })

    resolveLogin!()
  })

  it('botão é desabilitado durante o carregamento', async () => {
    let resolveLogin: () => void
    const loginPromise = new Promise<void>((resolve) => {
      resolveLogin = resolve
    })
    mockLogin.mockReturnValueOnce(loginPromise)
    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText('E-mail'), 'user@test.com')
    await user.type(screen.getByLabelText('Senha'), 'senha123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Entrando...' })).toBeDisabled()
    })

    resolveLogin!()
  })
})
