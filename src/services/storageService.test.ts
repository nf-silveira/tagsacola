import { describe, expect, it } from 'vitest'

import { createLabelBatch, createEmptyDraft } from '@/domain/label'
import { DEFAULT_PRINT_SETTINGS } from '@/domain/printSettings'

import { labelHistoryStore, printSettingsStore } from './storageService'

describe('storageService', () => {
  it('persiste as configurações de impressão salvas', () => {
    const settings = { ...DEFAULT_PRINT_SETTINGS, heightMm: 80, presetId: 'custom' as const }

    printSettingsStore.set(settings)

    expect(JSON.parse(window.localStorage.getItem('tag-sacola:print-settings:v1') ?? '{}')).toEqual(
      settings,
    )
    expect(printSettingsStore.getSnapshot()).toEqual(settings)
  })

  it('persiste o histórico de etiquetas geradas', () => {
    const batch = createLabelBatch({
      ...createEmptyDraft(),
      purchaseNumber: '2026',
      quantities: { dry: 2, refrigerated: 0, frozen: 0, pack: 0 },
    })

    labelHistoryStore.set([batch])

    const stored = JSON.parse(window.localStorage.getItem('tag-sacola:history:v1') ?? '[]')
    expect(stored).toHaveLength(1)
    expect(stored[0].purchaseNumber).toBe('2026')
    expect(labelHistoryStore.getSnapshot()).toHaveLength(1)
  })

  it('usa as dimensões padrão quando ainda não há nada salvo', () => {
    expect(printSettingsStore.getServerSnapshot()).toEqual(DEFAULT_PRINT_SETTINGS)
  })
})
