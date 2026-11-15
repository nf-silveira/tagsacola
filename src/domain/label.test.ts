import { describe, expect, it } from 'vitest'

import {
  countBags,
  createEmptyBagQuantities,
  createEmptyDraft,
  createLabelBatch,
  formatDateInputValue,
  formatLabelDateTime,
  formatQuantityLabel,
  formatTimeInputValue,
} from './label'

describe('countBags', () => {
  it('soma todas as categorias', () => {
    expect(countBags({ dry: 7, refrigerated: 1, frozen: 1, pack: 1 })).toBe(10)
  })

  it('retorna zero quando nenhuma sacola foi informada', () => {
    expect(countBags(createEmptyBagQuantities())).toBe(0)
  })
})

describe('formatQuantityLabel', () => {
  it('usa o singular para uma unidade', () => {
    expect(formatQuantityLabel('dry', 1)).toBe('1 seca')
    expect(formatQuantityLabel('refrigerated', 1)).toBe('1 resfriada')
    expect(formatQuantityLabel('frozen', 1)).toBe('1 congelada')
    expect(formatQuantityLabel('pack', 1)).toBe('1 pack')
  })

  it('usa o plural para várias unidades', () => {
    expect(formatQuantityLabel('dry', 7)).toBe('7 secas')
    expect(formatQuantityLabel('pack', 2)).toBe('2 packs')
  })
})

describe('formatLabelDateTime', () => {
  it('combina data e horário', () => {
    expect(formatLabelDateTime('2026-11-14', '07:45')).toBe('14/11 - 07:45')
  })

  it('mostra apenas a data quando o horário não foi informado', () => {
    expect(formatLabelDateTime('2026-11-14', null)).toBe('14/11')
  })

  it('mostra apenas o horário quando a data não foi informada', () => {
    expect(formatLabelDateTime(null, '07:45')).toBe('07:45')
  })

  it('retorna null quando nada foi informado', () => {
    expect(formatLabelDateTime(null, null)).toBeNull()
  })
})

describe('valores dos campos de data e horário', () => {
  it('formata a data local como yyyy-mm-dd', () => {
    expect(formatDateInputValue(new Date(2026, 10, 5))).toBe('2026-11-05')
  })

  it('formata o horário local como HH:mm com zero à esquerda', () => {
    expect(formatTimeInputValue(new Date(2026, 10, 5, 7, 4))).toBe('07:04')
  })
})

describe('createLabelBatch', () => {
  it('congela as quantidades e gera identificadores', () => {
    const draft = {
      ...createEmptyDraft(),
      customerName: 'Aline Chaves',
      quantities: { dry: 2, refrigerated: 1, frozen: 0, pack: 1 },
    }

    const batch = createLabelBatch(draft)
    draft.quantities.dry = 9

    expect(batch.quantities.dry).toBe(2)
    expect(batch.customerName).toBe('Aline Chaves')
    expect(batch.id).toMatch(/[0-9a-f-]{8,}/i)
    expect(Number.isNaN(Date.parse(batch.createdAt))).toBe(false)
  })
})
