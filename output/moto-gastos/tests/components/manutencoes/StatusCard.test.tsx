import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { StatusCard } from '@/components/manutencoes/StatusCard'
import type { ManutencaoStatusItem } from '@/types'

const mockTipo = { id: 1, nome: 'Óleo do Motor', intervalo_km: 3000, ativo: true }

const mockRealizada = {
  id: 10,
  tipo_manutencao_id: 1,
  data_realizacao: '2024-01-15',
  km_no_momento: 9000,
  valor_gasto: 85.0,
}

const baseItem: ManutencaoStatusItem = {
  tipo: mockTipo,
  ultimaManutencao: mockRealizada,
  km_proxima: 12000,
  km_restante: 1200,
  data_estimada: '2024-07-01',
  alerta_ativo: false,
  vencida: false,
  km_antecedencia: 300,
  notificacao_ativa: true,
}

describe('StatusCard — renderização básica', () => {
  it('renderiza nome do tipo de manutenção', () => {
    render(<StatusCard item={baseItem} kmAtual={10800} />)
    expect(screen.getByText('Óleo do Motor')).toBeInTheDocument()
  })

  it('renderiza intervalo formatado', () => {
    render(<StatusCard item={baseItem} kmAtual={10800} />)
    expect(screen.getByText('3.000 km')).toBeInTheDocument()
  })

  it('renderiza km restantes positivos', () => {
    render(<StatusCard item={baseItem} kmAtual={10800} />)
    expect(screen.getByText('1.200 km')).toBeInTheDocument()
  })

  it('renderiza badge OK quando item está em dia', () => {
    render(<StatusCard item={baseItem} kmAtual={10800} />)
    expect(screen.getByText('OK')).toBeInTheDocument()
  })

  it('renderiza data da última manutenção realizada', () => {
    render(<StatusCard item={baseItem} kmAtual={10800} />)
    expect(screen.getByText('Última realizada')).toBeInTheDocument()
  })

  it('renderiza data estimada', () => {
    render(<StatusCard item={baseItem} kmAtual={10800} />)
    expect(screen.getByText('Data estimada')).toBeInTheDocument()
  })

  it('exibe "Intervalo" como label', () => {
    render(<StatusCard item={baseItem} kmAtual={10800} />)
    expect(screen.getByText('Intervalo')).toBeInTheDocument()
  })

  it('exibe "KM restantes" como label', () => {
    render(<StatusCard item={baseItem} kmAtual={10800} />)
    expect(screen.getByText('KM restantes')).toBeInTheDocument()
  })
})

describe('StatusCard — estado de alerta', () => {
  it('renderiza badge Alerta quando alerta_ativo é true', () => {
    const itemAlerta = { ...baseItem, alerta_ativo: true, km_restante: 200 }
    render(<StatusCard item={itemAlerta} kmAtual={10800} />)
    expect(screen.getByText('Alerta')).toBeInTheDocument()
  })

  it('card tem borda amarela quando alerta_ativo e não vencida', () => {
    const itemAlerta = { ...baseItem, alerta_ativo: true }
    const { container } = render(<StatusCard item={itemAlerta} kmAtual={10800} />)
    expect(container.firstChild).toHaveClass('border-yellow-400')
  })
})

describe('StatusCard — estado vencida', () => {
  it('renderiza badge Vencida quando vencida é true', () => {
    const itemVencido = { ...baseItem, vencida: true, km_restante: -500 }
    render(<StatusCard item={itemVencido} kmAtual={10800} />)
    expect(screen.getByText('Vencida')).toBeInTheDocument()
  })

  it('exibe km negativo com prefixo "-"', () => {
    const itemVencido = { ...baseItem, vencida: true, km_restante: -500 }
    render(<StatusCard item={itemVencido} kmAtual={10800} />)
    expect(screen.getByText('-500 km')).toBeInTheDocument()
  })

  it('card tem borda destructive quando vencida', () => {
    const itemVencido = { ...baseItem, vencida: true, km_restante: -500 }
    const { container } = render(<StatusCard item={itemVencido} kmAtual={10800} />)
    expect(container.firstChild).toHaveClass('border-destructive/60')
  })
})

describe('StatusCard — sem última manutenção', () => {
  it('não renderiza seção de última manutenção quando ultimaManutencao é null', () => {
    const itemSemHistorico = { ...baseItem, ultimaManutencao: null }
    render(<StatusCard item={itemSemHistorico} kmAtual={10800} />)
    expect(screen.queryByText('Última realizada')).not.toBeInTheDocument()
  })

  it('calcula progresso baseado em km_inicial 0 quando sem última manutenção', () => {
    const itemSemHistorico = { ...baseItem, ultimaManutencao: null }
    // Não deve lançar erro
    expect(() => render(<StatusCard item={itemSemHistorico} kmAtual={10800} />)).not.toThrow()
  })
})

describe('StatusCard — cálculo de progresso', () => {
  it('renderiza barra de progresso', () => {
    const { container } = render(<StatusCard item={baseItem} kmAtual={10800} />)
    // Progress component renderiza um div com estilo
    const progressBar = container.querySelector('[style*="translateX"]')
    expect(progressBar).toBeTruthy()
  })

  it('não lança erro com intervalo_km zero', () => {
    const tipoSemIntervalo = { ...mockTipo, intervalo_km: 0 }
    const itemSemIntervalo = { ...baseItem, tipo: tipoSemIntervalo }
    expect(() => render(<StatusCard item={itemSemIntervalo} kmAtual={10800} />)).not.toThrow()
  })
})
