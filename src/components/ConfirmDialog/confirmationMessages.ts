import type { LabelBatch } from '@/domain/label'

export type PendingAction = { type: 'delete'; batch: LabelBatch } | { type: 'clear' }

export interface ConfirmationCopy {
  title: string
  description: string
  confirmLabel: string
}

/** Textos do diálogo de confirmação para a ação pendente; `null` quando não há ação. */
export function buildConfirmation(
  action: PendingAction | null,
  historyCount: number,
): ConfirmationCopy | null {
  if (action === null) {
    return null
  }

  if (action.type === 'delete') {
    const { purchaseNumber } = action.batch

    return {
      title: 'Excluir etiqueta do histórico?',
      description: purchaseNumber
        ? `A etiqueta da compra ${purchaseNumber} será removida deste computador. Esta ação não pode ser desfeita.`
        : 'Esta etiqueta será removida deste computador. Esta ação não pode ser desfeita.',
      confirmLabel: 'Excluir etiqueta',
    }
  }

  return {
    title: 'Limpar todo o histórico?',
    description: `Todas as etiquetas salvas neste computador (${historyCount}) serão removidas. Esta ação não pode ser desfeita.`,
    confirmLabel: 'Limpar histórico',
  }
}
