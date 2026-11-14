import { useCallback, useSyncExternalStore } from 'react'

import { MAX_HISTORY_ITEMS, type LabelBatch } from '@/domain/label'
import { labelHistoryStore } from '@/services/storageService'

interface UseLabelHistoryResult {
  batches: LabelBatch[]
  addBatch: (batch: LabelBatch) => void
  removeBatch: (id: string) => void
  clearHistory: () => void
}

export function useLabelHistory(): UseLabelHistoryResult {
  const batches = useSyncExternalStore(
    labelHistoryStore.subscribe,
    labelHistoryStore.getSnapshot,
    labelHistoryStore.getServerSnapshot,
  )

  const addBatch = useCallback((batch: LabelBatch) => {
    labelHistoryStore.set([batch, ...labelHistoryStore.getSnapshot()].slice(0, MAX_HISTORY_ITEMS))
  }, [])

  const removeBatch = useCallback((id: string) => {
    labelHistoryStore.set(
      labelHistoryStore.getSnapshot().filter((batch) => batch.id !== id),
    )
  }, [])

  const clearHistory = useCallback(() => {
    labelHistoryStore.set([])
  }, [])

  return { batches, addBatch, removeBatch, clearHistory }
}
