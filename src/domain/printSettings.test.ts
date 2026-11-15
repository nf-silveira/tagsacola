import { describe, expect, it } from 'vitest'

import {
  DEFAULT_PRINT_SETTINGS,
  MAX_PRINTABLE_WIDTH_MM,
  PRINT_PRESETS,
  printSettingsSchema,
} from './printSettings'

describe('printSettingsSchema', () => {
  it('aceita as dimensões padrão do projeto', () => {
    const result = printSettingsSchema.safeParse(DEFAULT_PRINT_SETTINGS)

    expect(result.success).toBe(true)
    expect(DEFAULT_PRINT_SETTINGS).toMatchObject({
      widthMm: 72,
      heightMm: 100,
      marginMm: 2,
      presetId: 'standard',
    })
  })

  it('rejeita largura acima da área imprimível da Sweda SI-300', () => {
    const result = printSettingsSchema.safeParse({
      ...DEFAULT_PRINT_SETTINGS,
      widthMm: MAX_PRINTABLE_WIDTH_MM + 1,
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.message).toContain('72 mm')
  })

  it('rejeita margens que consomem toda a largura', () => {
    const result = printSettingsSchema.safeParse({
      ...DEFAULT_PRINT_SETTINGS,
      widthMm: 40,
      marginMm: 20,
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.path).toEqual(['marginMm'])
  })

  it('rejeita dimensões não numéricas', () => {
    const result = printSettingsSchema.safeParse({
      ...DEFAULT_PRINT_SETTINGS,
      heightMm: Number.NaN,
    })

    expect(result.success).toBe(false)
  })

  it('mantém os modelos padrão e compacto em 72 mm de largura', () => {
    expect(PRINT_PRESETS.standard).toMatchObject({ widthMm: 72, heightMm: 100 })
    expect(PRINT_PRESETS.compact).toMatchObject({ widthMm: 72, heightMm: 80 })
  })
})
