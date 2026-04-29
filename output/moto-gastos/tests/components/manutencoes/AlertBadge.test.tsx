import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { AlertBadge } from '@/components/manutencoes/AlertBadge'

describe('AlertBadge', () => {
  it('exibe badge "Vencida" quando vencida=true', () => {
    render(<AlertBadge vencida={true} alertaAtivo={false} />)
    expect(screen.getByText('Vencida')).toBeInTheDocument()
  })

  it('exibe badge "Alerta" quando alertaAtivo=true e não vencida', () => {
    render(<AlertBadge vencida={false} alertaAtivo={true} />)
    expect(screen.getByText('Alerta')).toBeInTheDocument()
  })

  it('exibe badge "OK" quando não vencida e sem alerta', () => {
    render(<AlertBadge vencida={false} alertaAtivo={false} />)
    expect(screen.getByText('OK')).toBeInTheDocument()
  })

  it('prioriza "Vencida" quando ambos vencida e alertaAtivo são true', () => {
    render(<AlertBadge vencida={true} alertaAtivo={true} />)
    expect(screen.getByText('Vencida')).toBeInTheDocument()
    expect(screen.queryByText('Alerta')).not.toBeInTheDocument()
  })

  it('badge Vencida tem variante destructive', () => {
    const { container } = render(<AlertBadge vencida={true} alertaAtivo={false} />)
    expect(container.firstChild).toHaveClass('bg-destructive')
  })

  it('badge OK tem variante success', () => {
    const { container } = render(<AlertBadge vencida={false} alertaAtivo={false} />)
    expect(container.firstChild).toHaveClass('bg-green-100')
  })

  it('badge Alerta tem variante warning', () => {
    const { container } = render(<AlertBadge vencida={false} alertaAtivo={true} />)
    expect(container.firstChild).toHaveClass('bg-yellow-100')
  })
})
