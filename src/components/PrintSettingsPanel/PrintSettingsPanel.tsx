import { useState } from 'react'
import { FiRotateCcw, FiSave, FiSettings } from 'react-icons/fi'

import {
  MAX_PRINT_HEIGHT_MM,
  MAX_PRINT_MARGIN_MM,
  MAX_PRINTABLE_WIDTH_MM,
  MIN_PRINT_DIMENSION_MM,
  MIN_PRINT_MARGIN_MM,
  PRINT_PRESETS,
  type PrintPresetId,
  type PrintSettings,
} from '@/domain/printSettings'
import type { PrintDimensionPatch, PrintSettingsErrors } from '@/hooks/usePrintSettings'

import styles from './PrintSettingsPanel.module.css'

interface PrintSettingsPanelProps {
  settings: PrintSettings
  errors: PrintSettingsErrors
  isDirty: boolean
  onChange: (patch: PrintDimensionPatch) => void
  onChangePreset: (presetId: PrintPresetId) => void
  onSave: () => boolean
  onRestoreDefault: () => void
}

const PRESET_OPTIONS: { id: PrintPresetId; label: string }[] = [
  { id: 'standard', label: `Padrão (${PRINT_PRESETS.standard.widthMm} × ${PRINT_PRESETS.standard.heightMm} mm)` },
  { id: 'compact', label: `Compacta (${PRINT_PRESETS.compact.widthMm} × ${PRINT_PRESETS.compact.heightMm} mm)` },
  { id: 'custom', label: 'Personalizada' },
]

export function PrintSettingsPanel({
  settings,
  errors,
  isDirty,
  onChange,
  onChangePreset,
  onSave,
  onRestoreDefault,
}: PrintSettingsPanelProps) {
  const [feedback, setFeedback] = useState<string | null>(null)

  function handleSave() {
    const wasSaved = onSave()
    setFeedback(wasSaved ? 'Configurações salvas neste navegador.' : 'Revise os valores antes de salvar.')
  }

  function handleRestoreDefault() {
    onRestoreDefault()
    setFeedback('Dimensões padrão restauradas.')
  }

  return (
    <section className={styles.panel} aria-labelledby="print-settings-title">
      <div className={styles.panelHeader}>
        <FiSettings aria-hidden="true" />
        <h2 id="print-settings-title" className={styles.panelTitle}>
          Configurações de Impressão
        </h2>
      </div>

      <div className={styles.panelBody}>
        <div className={styles.fields}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Largura (mm)</span>
            <input
              type="number"
              className={`form-control form-control-sm ${styles.input}`}
              min={MIN_PRINT_DIMENSION_MM}
              max={MAX_PRINTABLE_WIDTH_MM}
              step={1}
              value={settings.widthMm}
              onChange={(event) => onChange({ widthMm: event.target.valueAsNumber })}
              aria-invalid={Boolean(errors.widthMm)}
            />
            {errors.widthMm && (
              <span className={styles.error} role="alert">
                {errors.widthMm}
              </span>
            )}
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Altura (mm)</span>
            <input
              type="number"
              className={`form-control form-control-sm ${styles.input}`}
              min={MIN_PRINT_DIMENSION_MM}
              max={MAX_PRINT_HEIGHT_MM}
              step={1}
              value={settings.heightMm}
              onChange={(event) => onChange({ heightMm: event.target.valueAsNumber })}
              aria-invalid={Boolean(errors.heightMm)}
            />
            {errors.heightMm && (
              <span className={styles.error} role="alert">
                {errors.heightMm}
              </span>
            )}
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Margem (mm)</span>
            <input
              type="number"
              className={`form-control form-control-sm ${styles.input}`}
              min={MIN_PRINT_MARGIN_MM}
              max={MAX_PRINT_MARGIN_MM}
              step={1}
              value={settings.marginMm}
              onChange={(event) => onChange({ marginMm: event.target.valueAsNumber })}
              aria-invalid={Boolean(errors.marginMm)}
            />
            {errors.marginMm && (
              <span className={styles.error} role="alert">
                {errors.marginMm}
              </span>
            )}
          </label>

          <label className={`${styles.field} ${styles.presetField}`}>
            <span className={styles.fieldLabel}>Modelo</span>
            <select
              className={`form-select form-select-sm ${styles.input}`}
              value={settings.presetId}
              onChange={(event) => onChangePreset(event.target.value as PrintPresetId)}
            >
              {PRESET_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className={styles.hint}>
          A Sweda SI-300 usa bobina contínua de {MAX_PRINTABLE_WIDTH_MM} mm, com 72 mm
          de área imprimível. O corte é automático, feito pela impressora.
        </p>

        <div className={styles.actions}>
          <button type="button" className={styles.secondaryButton} onClick={handleRestoreDefault}>
            <FiRotateCcw aria-hidden="true" />
            Restaurar padrão
          </button>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleSave}
            disabled={!isDirty}
          >
            <FiSave aria-hidden="true" />
            Salvar
          </button>
        </div>

        {feedback && (
          <p className={styles.feedback} role="status">
            {feedback}
          </p>
        )}
      </div>
    </section>
  )
}
