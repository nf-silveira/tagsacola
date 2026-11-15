import { describe, expect, it } from 'vitest'

import type { LabelBatch } from '@/domain/label'
import { buildConfirmation } from './confirmationMessages'

function createBatch(purchaseNumber: string | null): LabelBatch {
  return {
    id: 'batch-1',
    createdAt: '2026-11-14T10:00:00.000Z',
    purchaseNumber,
    customerName: 'Aline Chaves',
    date: null,
    time: null,
    deliveryMode: null,
    quantities: { dry: 1, refrigerated: 0, frozen: 0, pack: 0 },
  }
}

describe('buildConfirmation', () => {
  it('não devolve texto quando não há ação pendente', () => {
    expect(buildConfirmation(null, 3)).toBeNull()
  })

  it('cita o número da compra ao excluir uma etiqueta identificada', () => {
    const confirmation = buildConfirmation({ type: 'delete', batch: createBatch('2026') }, 3)

    expect(confirmation?.title).toBe('Excluir etiqueta do histórico?')
    expect(confirmation?.description).toContain('compra 2026')
    expect(confirmation?.confirmLabel).toBe('Excluir etiqueta')
  })

  it('usa texto genérico ao excluir uma etiqueta sem número', () => {
    const confirmation = buildConfirmation({ type: 'delete', batch: createBatch(null) }, 3)

    expect(confirmation?.description).not.toContain('compra')
    expect(confirmation?.description).toContain('Esta etiqueta será removida')
  })

  it('informa quantas etiquetas serão removidas ao limpar o histórico', () => {
    const confirmation = buildConfirmation({ type: 'clear' }, 7)

    expect(confirmation?.title).toBe('Limpar todo o histórico?')
    expect(confirmation?.description).toContain('(7)')
    expect(confirmation?.confirmLabel).toBe('Limpar histórico')
  })
})
