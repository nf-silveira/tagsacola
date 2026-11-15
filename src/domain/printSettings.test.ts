import { describe, expect, it } from 'vitest'

import {
  arePrintSettingsEqual,
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
      widthMm: 80,
      heightMm: 55,
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
    expect(result.error?.issues[0]?.message).toContain('80 mm')
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

  it('mantém o modelo padrão em 80 × 55 mm e o compacto em 72 × 80 mm', () => {
    expect(PRINT_PRESETS.standard).toMatchObject({ widthMm: 80, heightMm: 55 })
    expect(PRINT_PRESETS.compact).toMatchObject({ widthMm: 72, heightMm: 80 })
  })
})

describe('arePrintSettingsEqual', () => {
  it('considera iguais as configurações com os mesmos valores', () => {
    expect(arePrintSettingsEqual(DEFAULT_PRINT_SETTINGS, { ...DEFAULT_PRINT_SETTINGS })).toBe(
      true,
    )
  })

  it('ignora a ordem das propriedades', () => {
    const reordered = {
      marginMm: DEFAULT_PRINT_SETTINGS.marginMm,
      heightMm: DEFAULT_PRINT_SETTINGS.heightMm,
      widthMm: DEFAULT_PRINT_SETTINGS.widthMm,
      presetId: DEFAULT_PRINT_SETTINGS.presetId,
    }

    expect(arePrintSettingsEqual(DEFAULT_PRINT_SETTINGS, reordered)).toBe(true)
  })

  it('detecta mudança em qualquer dimensão ou no modelo', () => {
    expect(
      arePrintSettingsEqual(DEFAULT_PRINT_SETTINGS, { ...DEFAULT_PRINT_SETTINGS, widthMm: 72 }),
    ).toBe(false)
    expect(
      arePrintSettingsEqual(DEFAULT_PRINT_SETTINGS, {
        ...DEFAULT_PRINT_SETTINGS,
        marginMm: 4,
      }),
    ).toBe(false)
    expect(
      arePrintSettingsEqual(DEFAULT_PRINT_SETTINGS, {
        ...DEFAULT_PRINT_SETTINGS,
        presetId: 'custom',
      }),
    ).toBe(false)
  })
})
