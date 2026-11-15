import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'

import {
  arePrintSettingsEqual,
  DEFAULT_PRINT_SETTINGS,
  PRINT_PRESETS,
  printSettingsSchema,
  type PrintPresetId,
  type PrintSettings,
} from '@/domain/printSettings'
import { printSettingsStore } from '@/services/storageService'

export type PrintSettingsErrors = Partial<
  Record<'widthMm' | 'heightMm' | 'marginMm', string>
>

export type PrintDimensionPatch = Partial<Omit<PrintSettings, 'presetId'>>

interface UsePrintSettingsResult {
  settings: PrintSettings
  errors: PrintSettingsErrors
  isDirty: boolean
  changeSettings: (patch: PrintDimensionPatch) => void
  changePreset: (presetId: PrintPresetId) => void
  saveSettings: () => boolean
  restoreDefault: () => void
}

function validateSettings(settings: PrintSettings): PrintSettingsErrors {
  const result = printSettingsSchema.safeParse(settings)

  if (result.success) {
    return {}
  }

  const errors: PrintSettingsErrors = {}

  for (const issue of result.error.issues) {
    const field = issue.path[0]

    if (field === 'widthMm' || field === 'heightMm' || field === 'marginMm') {
      errors[field] ??= issue.message
    }
  }

  return errors
}

export function usePrintSettings(): UsePrintSettingsResult {
  const savedSettings = useSyncExternalStore(
    printSettingsStore.subscribe,
    printSettingsStore.getSnapshot,
    printSettingsStore.getServerSnapshot,
  )

  /** Edições ainda não salvas; `null` significa "usar o que está persistido". */
  const [unsavedSettings, setUnsavedSettings] = useState<PrintSettings | null>(null)

  const settings = unsavedSettings ?? savedSettings
  const errors = useMemo(() => validateSettings(settings), [settings])

  const changeSettings = useCallback(
    (patch: PrintDimensionPatch) => {
      setUnsavedSettings((current) => ({
        ...(current ?? savedSettings),
        ...patch,
        presetId: 'custom',
      }))
    },
    [savedSettings],
  )

  const changePreset = useCallback(
    (presetId: PrintPresetId) => {
      if (presetId === 'custom') {
        setUnsavedSettings((current) => ({
          ...(current ?? savedSettings),
          presetId,
        }))
        return
      }

      setUnsavedSettings({ presetId, ...PRINT_PRESETS[presetId] })
    },
    [savedSettings],
  )

  const saveSettings = useCallback(() => {
    if (Object.keys(validateSettings(settings)).length > 0) {
      return false
    }

    printSettingsStore.set(settings)
    setUnsavedSettings(null)
    return true
  }, [settings])

  const restoreDefault = useCallback(() => {
    printSettingsStore.set(DEFAULT_PRINT_SETTINGS)
    setUnsavedSettings(null)
  }, [])

  const isDirty = useMemo(
    () => !arePrintSettingsEqual(settings, savedSettings),
    [settings, savedSettings],
  )

  return {
    settings,
    errors,
    isDirty,
    changeSettings,
    changePreset,
    saveSettings,
    restoreDefault,
  }
}
