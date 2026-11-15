import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { LabelDraft } from '@/domain/label'
import { DEFAULT_PRINT_SETTINGS } from '@/domain/printSettings'

import { PrintableLabel } from './PrintableLabel'

function createDraft(overrides: Partial<LabelDraft> = {}): LabelDraft {
  return {
    purchaseNumber: '2026',
    customerName: 'Aline Chaves',
    date: '2026-11-14',
    time: '07:45',
    deliveryMode: 'scheduled',
    quantities: { dry: 7, refrigerated: 1, frozen: 1, pack: 1 },
    ...overrides,
  }
}

function renderLabel(overrides: Partial<LabelDraft> = {}) {
  return render(
    <PrintableLabel
      data={createDraft(overrides)}
      position={3}
      total={10}
      settings={DEFAULT_PRINT_SETTINGS}
    />,
  )
}

describe('PrintableLabel', () => {
  it('mostra a posição da sacola na sequência', () => {
    renderLabel()

    expect(screen.getByText('3 de 10')).toBeDefined()
  })

  it('resume as quantidades da compra com singular e plural', () => {
    renderLabel()

    expect(screen.getByText('7 secas')).toBeDefined()
    expect(screen.getByText('1 resfriada')).toBeDefined()
    expect(screen.getByText('1 congelada')).toBeDefined()
    expect(screen.getByText('1 pack')).toBeDefined()
  })

  it('aplica as dimensões em milímetros configuradas', () => {
    const { container } = renderLabel()

    const label = container.firstElementChild as HTMLElement
    expect(label.style.width).toBe('72mm')
    expect(label.style.height).toBe('100mm')
    expect(label.style.padding).toBe('2mm')
  })

  it('usa o formato "dd/mm - hh:mm" para data e horário', () => {
    renderLabel()

    expect(screen.getByText('14/11 - 07:45')).toBeDefined()
    expect(screen.getByText('Agendada')).toBeDefined()
  })

  it('omite os campos de identificação não informados', () => {
    renderLabel({
      purchaseNumber: null,
      customerName: null,
      date: null,
      time: null,
      deliveryMode: null,
    })

    expect(screen.queryByText('Cliente')).toBeNull()
    expect(screen.queryByText('Data e hora')).toBeNull()
    expect(screen.queryByText('Entrega')).toBeNull()
    expect(screen.queryByText('Não informado')).toBeNull()
    expect(screen.getByText('3 de 10')).toBeDefined()
  })

  it('mostra apenas as categorias com quantidade maior que zero', () => {
    renderLabel({ quantities: { dry: 2, refrigerated: 0, frozen: 0, pack: 0 } })

    expect(screen.getByText('2 secas')).toBeDefined()
    expect(screen.queryByText(/congelada/)).toBeNull()
    expect(screen.queryByText(/resfriada/)).toBeNull()
  })

  it('renderiza nomes longos sem truncar o conteúdo', () => {
    const longName = 'Maria Aparecida de Oliveira Santos Ferreira da Silva'
    renderLabel({ customerName: longName })

    expect(screen.getByText(longName)).toBeDefined()
  })

  it('difere os chips vazados (secas e pack) dos preenchidos', () => {
    renderLabel()

    const dryChip = screen.getByText('7 secas').closest('span')
    const frozenChip = screen.getByText('1 congelada').closest('span')

    expect(dryChip?.className).not.toBe(frozenChip?.className)
  })
})
