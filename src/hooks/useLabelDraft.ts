import { useCallback, useMemo, useState } from 'react'

import {
  createEmptyDraft,
  type BagCategory,
  type DeliveryMode,
  type LabelBatch,
  type LabelDraft,
} from '@/domain/label'
import { refreshCurrentDateTime, useCurrentDateTime } from '@/hooks/useCurrentDateTime'

export type IdentificationField = 'purchaseNumber' | 'customerName' | 'date' | 'time'

interface UseLabelDraftResult {
  draft: LabelDraft
  setIdentificationField: (field: IdentificationField, value: string) => void
  setDeliveryMode: (mode: DeliveryMode) => void
  setQuantity: (category: BagCategory, quantity: number) => void
  clearDraft: () => void
  loadBatch: (batch: LabelBatch) => void
}

/**
 * Data e horário vêm do relógio do computador enquanto o usuário não os edita.
 * Depois da primeira edição, o valor digitado (inclusive vazio) é respeitado.
 */
export function useLabelDraft(): UseLabelDraftResult {
  const [baseDraft, setBaseDraft] = useState<LabelDraft>(createEmptyDraft)
  const [isDateCustomized, setIsDateCustomized] = useState(false)
  const [isTimeCustomized, setIsTimeCustomized] = useState(false)
  const currentDateTime = useCurrentDateTime()

  const draft = useMemo<LabelDraft>(
    () => ({
      ...baseDraft,
      date: isDateCustomized ? baseDraft.date : (currentDateTime?.date ?? null),
      time: isTimeCustomized ? baseDraft.time : (currentDateTime?.time ?? null),
    }),
    [baseDraft, isDateCustomized, isTimeCustomized, currentDateTime],
  )

  const setIdentificationField = useCallback(
    (field: IdentificationField, value: string) => {
      if (field === 'date') {
        setIsDateCustomized(true)
      }

      if (field === 'time') {
        setIsTimeCustomized(true)
      }

      const normalized = value.trim() === '' ? null : value
      setBaseDraft((current) => ({ ...current, [field]: normalized }))
    },
    [],
  )

  const setDeliveryMode = useCallback((mode: DeliveryMode) => {
    setBaseDraft((current) => ({ ...current, deliveryMode: mode }))
  }, [])

  const setQuantity = useCallback((category: BagCategory, quantity: number) => {
    const safeQuantity = Number.isFinite(quantity) ? Math.max(0, Math.trunc(quantity)) : 0
    setBaseDraft((current) => ({
      ...current,
      quantities: { ...current.quantities, [category]: safeQuantity },
    }))
  }, [])

  const clearDraft = useCallback(() => {
    setBaseDraft(createEmptyDraft())
    setIsDateCustomized(false)
    setIsTimeCustomized(false)
    refreshCurrentDateTime()
  }, [])

  const loadBatch = useCallback((batch: LabelBatch) => {
    setBaseDraft({
      purchaseNumber: batch.purchaseNumber,
      customerName: batch.customerName,
      date: batch.date,
      time: batch.time,
      deliveryMode: batch.deliveryMode,
      quantities: { ...batch.quantities },
    })
    setIsDateCustomized(true)
    setIsTimeCustomized(true)
  }, [])

  return {
    draft,
    setIdentificationField,
    setDeliveryMode,
    setQuantity,
    clearDraft,
    loadBatch,
  }
}
