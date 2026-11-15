import { describe, expect, it } from 'vitest'

import type { LabelBatch } from './label'
import {
  filterBatches,
  formatBatchDateTime,
  getPageItems,
  paginateBatches,
} from './history'

function createBatch(overrides: Partial<LabelBatch> = {}): LabelBatch {
  return {
    id: overrides.id ?? 'batch-1',
    createdAt: overrides.createdAt ?? '2026-11-14T10:00:00.000Z',
    purchaseNumber: null,
    customerName: null,
    date: null,
    time: null,
    deliveryMode: null,
    quantities: { dry: 1, refrigerated: 0, frozen: 0, pack: 0 },
    ...overrides,
  }
}

describe('filterBatches', () => {
  const batches = [
    createBatch({ id: 'a', customerName: 'João Álvares', purchaseNumber: '2026' }),
    createBatch({ id: 'b', customerName: 'Aline Chaves', purchaseNumber: '3041' }),
  ]

  it('devolve todos os registros quando a busca está vazia', () => {
    expect(filterBatches(batches, '   ')).toHaveLength(2)
  })

  it('encontra o cliente ignorando maiúsculas e acentos', () => {
    expect(filterBatches(batches, 'JOAO').map((batch) => batch.id)).toEqual(['a'])
    expect(filterBatches(batches, 'alvares').map((batch) => batch.id)).toEqual(['a'])
  })

  it('encontra pelo número da compra', () => {
    expect(filterBatches(batches, '304').map((batch) => batch.id)).toEqual(['b'])
  })

  it('devolve lista vazia quando nada corresponde', () => {
    expect(filterBatches(batches, 'inexistente')).toEqual([])
  })
})

describe('paginateBatches', () => {
  const batches = Array.from({ length: 25 }, (_, index) =>
    createBatch({ id: `batch-${index + 1}` }),
  )

  it('fatia a página pedida', () => {
    const pagination = paginateBatches(batches, 10, 2)

    expect(pagination.currentPage).toBe(2)
    expect(pagination.totalPages).toBe(3)
    expect(pagination.firstItemIndex).toBe(10)
    expect(pagination.visibleBatches).toHaveLength(10)
    expect(pagination.visibleBatches[0]?.id).toBe('batch-11')
  })

  it('recorta a página pedida para a última existente', () => {
    const pagination = paginateBatches(batches, 10, 99)

    expect(pagination.currentPage).toBe(3)
    expect(pagination.visibleBatches).toHaveLength(5)
  })

  it('recorta páginas menores que 1', () => {
    expect(paginateBatches(batches, 10, 0).currentPage).toBe(1)
  })

  it('mantém uma página quando não há registros', () => {
    const pagination = paginateBatches([], 10, 1)

    expect(pagination.totalPages).toBe(1)
    expect(pagination.visibleBatches).toEqual([])
    expect(pagination.pageItems).toEqual([1])
  })
})

describe('getPageItems', () => {
  it('lista todas as páginas quando são poucas', () => {
    expect(getPageItems(2, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('usa intervalos nas pontas quando há muitas páginas', () => {
    expect(getPageItems(5, 20)).toEqual([1, 'gap-start', 4, 5, 6, 'gap-end', 20])
  })

  it('não repete o primeiro nem o último atalho', () => {
    expect(getPageItems(1, 20)).toEqual([1, 2, 'gap-end', 20])
    expect(getPageItems(20, 20)).toEqual([1, 'gap-start', 19, 20])
  })
})

describe('formatBatchDateTime', () => {
  it('usa a data e o horário informados', () => {
    const batch = createBatch({ date: '2026-11-14', time: '07:45' })
    expect(formatBatchDateTime(batch)).toBe('14/11/2026 às 07:45')
  })

  it('mostra apenas a data quando o horário não foi informado', () => {
    expect(formatBatchDateTime(createBatch({ date: '2026-11-14' }))).toBe('14/11/2026')
  })

  it('cai para a data de criação quando a data não foi informada', () => {
    const createdAt = '2026-11-14T10:00:00.000Z'
    const expected = new Date(createdAt).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    })

    expect(formatBatchDateTime(createBatch({ createdAt }))).toBe(expected)
  })
})
