import { useCallback, useState } from 'react'

import {
  createEmptyDraft,
  type BagCategory,
  type DeliveryMode,
  type LabelBatch,
  type LabelDraft,
} from '@/domain/label'

export type IdentificationField = 'purchaseNumber' | 'customerName' | 'date' | 'time'

interface UseLabelDraftResult {
  draft: LabelDraft
  setIdentificationField: (field: IdentificationField, value: string) => void
  setDeliveryMode: (mode: DeliveryMode) => void
  setQuantity: (category: BagCategory, quantity: number) => void
  clearDraft: () => void
  loadBatch: (batch: LabelBatch) => void
}

export function useLabelDraft(): UseLabelDraftResult {
  const [draft, setDraft] = useState<LabelDraft>(createEmptyDraft)

  const setIdentificationField = useCallback(
    (field: IdentificationField, value: string) => {
      const normalized = value.trim() === '' ? null : value
      setDraft((current) => ({ ...current, [field]: normalized }))
    },
    [],
  )

  const setDeliveryMode = useCallback((mode: DeliveryMode) => {
    setDraft((current) => ({ ...current, deliveryMode: mode }))
  }, [])

  const setQuantity = useCallback((category: BagCategory, quantity: number) => {
    const safeQuantity = Number.isFinite(quantity) ? Math.max(0, Math.trunc(quantity)) : 0
    setDraft((current) => ({
      ...current,
      quantities: { ...current.quantities, [category]: safeQuantity },
    }))
  }, [])

  const clearDraft = useCallback(() => {
    setDraft(createEmptyDraft())
  }, [])

  const loadBatch = useCallback((batch: LabelBatch) => {
    setDraft({
      purchaseNumber: batch.purchaseNumber,
      customerName: batch.customerName,
      date: batch.date,
      time: batch.time,
      deliveryMode: batch.deliveryMode,
      quantities: { ...batch.quantities },
    })
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
