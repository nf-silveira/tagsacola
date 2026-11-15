/**
 * Configurações de impressão da etiqueta (Sweda SI-300, bobina contínua de 80 mm).
 *
 * Dimensões iniciais de projeto, configuráveis pelo usuário e independentes dos
 * dados de cada compra.
 */

import { z } from 'zod'

/** Largura máxima da bobina informada pelo fabricante. */
export const MAX_PRINTABLE_WIDTH_MM = 80
export const MIN_PRINT_DIMENSION_MM = 20
export const MAX_PRINT_HEIGHT_MM = 300
export const MIN_PRINT_MARGIN_MM = 0
export const MAX_PRINT_MARGIN_MM = 10

export const PRINT_PRESET_IDS = ['standard', 'compact', 'custom'] as const

export type PrintPresetId = (typeof PRINT_PRESET_IDS)[number]

export interface PrintPreset {
  label: string
  widthMm: number
  heightMm: number
  marginMm: number
}

export const PRINT_PRESETS: Record<Exclude<PrintPresetId, 'custom'>, PrintPreset> = {
  standard: { label: 'Padrão', widthMm: 80, heightMm: 55, marginMm: 2 },
  compact: { label: 'Compacta', widthMm: 72, heightMm: 80, marginMm: 2 },
}

export const printSettingsSchema = z
  .object({
    presetId: z.enum(PRINT_PRESET_IDS),
    widthMm: z
      .number()
      .min(MIN_PRINT_DIMENSION_MM, 'Largura mínima de 20 mm.')
      .max(MAX_PRINTABLE_WIDTH_MM, 'Largura máxima de 80 mm.'),
    heightMm: z
      .number()
      .min(MIN_PRINT_DIMENSION_MM, 'Altura mínima de 20 mm.')
      .max(MAX_PRINT_HEIGHT_MM, 'Altura máxima de 300 mm.'),
    marginMm: z
      .number()
      .min(MIN_PRINT_MARGIN_MM, 'A margem não pode ser negativa.')
      .max(MAX_PRINT_MARGIN_MM, 'Margem máxima de 10 mm.'),
  })
  .superRefine((settings, ctx) => {
    if (settings.marginMm * 2 >= settings.widthMm) {
      ctx.addIssue({
        code: 'custom',
        path: ['marginMm'],
        message: 'As margens não podem consumir toda a largura.',
      })
    }

    if (settings.marginMm * 2 >= settings.heightMm) {
      ctx.addIssue({
        code: 'custom',
        path: ['marginMm'],
        message: 'As margens não podem consumir toda a altura.',
      })
    }
  })

export type PrintSettings = z.infer<typeof printSettingsSchema>

export const DEFAULT_PRINT_SETTINGS: PrintSettings = {
  presetId: 'standard',
  ...PRINT_PRESETS.standard,
}
