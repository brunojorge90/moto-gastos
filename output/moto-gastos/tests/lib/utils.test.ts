import { describe, it, expect } from 'vitest'
import { cn, formatCurrency, formatKm, formatDate } from '@/lib/utils'

describe('cn', () => {
  it('retorna string vazia sem argumentos', () => {
    expect(cn()).toBe('')
  })

  it('combina classes simples', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('ignora valores falsy', () => {
    expect(cn('foo', false, undefined, null, 'bar')).toBe('foo bar')
  })

  it('faz merge de classes Tailwind conflitantes', () => {
    const result = cn('p-2', 'p-4')
    expect(result).toBe('p-4')
  })

  it('aceita objeto condicional', () => {
    expect(cn({ 'text-red-500': true, 'text-blue-500': false })).toBe('text-red-500')
  })

  it('aceita array de classes', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })
})

describe('formatCurrency', () => {
  it('formata zero como R$\u00a00,00', () => {
    const result = formatCurrency(0)
    expect(result).toMatch(/R\$\s*0,00/)
  })

  it('formata valor inteiro positivo', () => {
    const result = formatCurrency(1500)
    expect(result).toMatch(/R\$\s*1\.500,00/)
  })

  it('formata valor com centavos', () => {
    const result = formatCurrency(99.99)
    expect(result).toMatch(/R\$\s*99,99/)
  })

  it('formata valor negativo', () => {
    const result = formatCurrency(-200)
    expect(result).toMatch(/-.*200/)
  })

  it('formata valor grande', () => {
    const result = formatCurrency(1000000)
    expect(result).toMatch(/1\.000\.000/)
  })
})

describe('formatKm', () => {
  it('formata zero', () => {
    expect(formatKm(0)).toBe('0 km')
  })

  it('formata valor simples', () => {
    expect(formatKm(100)).toBe('100 km')
  })

  it('formata valor com separador de milhar', () => {
    expect(formatKm(12000)).toBe('12.000 km')
  })

  it('formata valor grande', () => {
    expect(formatKm(150000)).toBe('150.000 km')
  })
})

describe('formatDate', () => {
  it('formata data ISO para pt-BR', () => {
    // 2024-01-15 deve ser formatado como 15/01/2024
    const result = formatDate('2024-01-15T00:00:00.000Z')
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/)
  })

  it('formata data sem hora', () => {
    const result = formatDate('2024-06-20')
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/)
  })

  it('retorna string de data para datas válidas', () => {
    const result = formatDate('2023-12-31')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})
