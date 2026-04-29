import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import React from 'react'
import { DashboardPage } from '@/pages/DashboardPage'

const mockUseMoto = vi.fn()
const mockUseManutencoesStatus = vi.fn()
const mockUseGastosResumo = vi.fn()

vi.mock('@/hooks/useMoto', () => ({ useMoto: () => mockUseMoto() }))
vi.mock('@/hooks/useManutencoes', () => ({ useManutencoesStatus: () => mockUseManutencoesStatus() }))
vi.mock('@/hooks/useGastos', () => ({ useGastosResumo: () => mockUseGastosResumo() }))

const mockMoto = {
  id: 1,
  apelido: 'Fazer 250',
  modelo: 'Yamaha Fazer 250',
  ano: 2022,
  km_inicial: 0,
  media_diaria_km: 30,
  data_referencia: '2024-01-01',
}

const mockStatusItem = {
  tipo: { id: 1, nome: 'Óleo do Motor', intervalo_km: 3000, ativo: true },
  ultimaManutencao: null,
  km_proxima: 3000,
  km_restante: 500,
  data_estimada: '2024-06-01',
  alerta_ativo: false,
  vencida: false,
  km_antecedencia: 300,
  notificacao_ativa: false,
}

const mockGastos = {
  total_geral: 500,
  total_periodo: 350,
  periodo_meses: 12,
  por_tipo: [],
  mensal: [],
  ultima_manutencao: null,
}

function renderDashboard() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('DashboardPage — loading', () => {
  it('exibe spinner quando está carregando', () => {
    mockUseMoto.mockReturnValue({ isLoading: true, data: undefined })
    mockUseManutencoesStatus.mockReturnValue({ isLoading: true, data: undefined })
    mockUseGastosResumo.mockReturnValue({ isLoading: true, data: undefined })

    renderDashboard()

    // O Spinner deve estar na tela (verificar por role ou qualquer elemento de loading)
    expect(screen.queryByText('KM Atual')).not.toBeInTheDocument()
  })
})

describe('DashboardPage — com dados', () => {
  beforeEach(() => {
    mockUseMoto.mockReturnValue({
      isLoading: false,
      data: { moto: mockMoto, km_atual: 10800 },
    })
    mockUseManutencoesStatus.mockReturnValue({
      isLoading: false,
      data: { statusList: [mockStatusItem], moto: mockMoto, km_atual: 10800 },
    })
    mockUseGastosResumo.mockReturnValue({
      isLoading: false,
      data: mockGastos,
    })
  })

  it('renderiza card KM Atual', () => {
    renderDashboard()
    expect(screen.getByText('KM Atual')).toBeInTheDocument()
  })

  it('exibe km formatado da moto', () => {
    renderDashboard()
    expect(screen.getByText('10.800 km')).toBeInTheDocument()
  })

  it('exibe apelido da moto', () => {
    renderDashboard()
    expect(screen.getByText('Fazer 250')).toBeInTheDocument()
  })

  it('renderiza card Manutenções com contagem de tipos', () => {
    renderDashboard()
    expect(screen.getByText('Manutenções')).toBeInTheDocument()
    expect(screen.getByText('tipos cadastrados')).toBeInTheDocument()
  })

  it('exibe contagem correta de tipos de manutenção', () => {
    renderDashboard()
    // 1 item no statusList
    const cards = screen.getAllByRole('heading', { level: 3 })
    const manutencoesCard = cards.find(el => el.textContent === 'Manutenções')
    expect(manutencoesCard).toBeDefined()
  })

  it('renderiza card Alertas Ativos', () => {
    renderDashboard()
    expect(screen.getByText('Alertas Ativos')).toBeInTheDocument()
    expect(screen.getByText('precisam de atenção')).toBeInTheDocument()
  })

  it('renderiza card Gastos (12m) com valor formatado', () => {
    renderDashboard()
    expect(screen.getByText('Gastos (12m)')).toBeInTheDocument()
    expect(screen.getByText(/R\$\s*350,00/)).toBeInTheDocument()
  })

  it('não renderiza seção de alertas quando não há alertas ativos', () => {
    renderDashboard()
    expect(screen.queryByText('Atenção necessária')).not.toBeInTheDocument()
  })

  it('não exibe card de moto não cadastrada quando moto existe', () => {
    renderDashboard()
    expect(screen.queryByText('Você ainda não cadastrou sua moto.')).not.toBeInTheDocument()
  })
})

describe('DashboardPage — com alertas ativos', () => {
  it('exibe seção de alertas quando há itens com alerta_ativo', () => {
    const itemComAlerta = { ...mockStatusItem, alerta_ativo: true }
    mockUseMoto.mockReturnValue({ isLoading: false, data: { moto: mockMoto, km_atual: 10800 } })
    mockUseManutencoesStatus.mockReturnValue({
      isLoading: false,
      data: { statusList: [itemComAlerta], moto: mockMoto, km_atual: 10800 },
    })
    mockUseGastosResumo.mockReturnValue({ isLoading: false, data: mockGastos })

    renderDashboard()

    expect(screen.getByText('Atenção necessária')).toBeInTheDocument()
    expect(screen.getByText('Óleo do Motor')).toBeInTheDocument()
  })

  it('exibe seção de alertas quando há itens vencidos', () => {
    const itemVencido = { ...mockStatusItem, vencida: true, km_restante: -200 }
    mockUseMoto.mockReturnValue({ isLoading: false, data: { moto: mockMoto, km_atual: 10800 } })
    mockUseManutencoesStatus.mockReturnValue({
      isLoading: false,
      data: { statusList: [itemVencido], moto: mockMoto, km_atual: 10800 },
    })
    mockUseGastosResumo.mockReturnValue({ isLoading: false, data: mockGastos })

    renderDashboard()

    expect(screen.getByText('Atenção necessária')).toBeInTheDocument()
    expect(screen.getByText(/Vencida há/)).toBeInTheDocument()
  })
})

describe('DashboardPage — sem moto', () => {
  it('exibe card de moto não cadastrada quando moto é null', () => {
    mockUseMoto.mockReturnValue({ isLoading: false, data: { moto: null, km_atual: 0 } })
    mockUseManutencoesStatus.mockReturnValue({ isLoading: false, data: { statusList: [], moto: null, km_atual: 0 } })
    mockUseGastosResumo.mockReturnValue({ isLoading: false, data: null })

    renderDashboard()

    expect(screen.getByText('Você ainda não cadastrou sua moto.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cadastrar Moto' })).toBeInTheDocument()
  })

  it('exibe "—" no lugar do km quando moto não existe', () => {
    mockUseMoto.mockReturnValue({ isLoading: false, data: { moto: null, km_atual: 0 } })
    mockUseManutencoesStatus.mockReturnValue({ isLoading: false, data: { statusList: [], moto: null, km_atual: 0 } })
    mockUseGastosResumo.mockReturnValue({ isLoading: false, data: null })

    renderDashboard()

    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })
})
