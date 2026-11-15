import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { DEFAULT_PRINT_SETTINGS } from '@/domain/printSettings'

import { PrintSettingsPanel } from './PrintSettingsPanel'

interface RenderPanelProps {
  errors?: { widthMm?: string; heightMm?: string; marginMm?: string }
  isDirty?: boolean
  onSave?: () => boolean
}

function renderPanel({
  errors = {},
  isDirty = false,
  onSave = () => true,
}: RenderPanelProps = {}) {
  const handlers = {
    onChange: vi.fn(),
    onChangePreset: vi.fn(),
    onSave: vi.fn(onSave),
    onRestoreDefault: vi.fn(),
  }

  render(
    <PrintSettingsPanel
      settings={DEFAULT_PRINT_SETTINGS}
      errors={errors}
      isDirty={isDirty}
      {...handlers}
    />,
  )

  return handlers
}

describe('PrintSettingsPanel — dimensões', () => {
  it('mostra as dimensões e a margem atuais', () => {
    renderPanel()

    expect((screen.getByLabelText('Largura (mm)') as HTMLInputElement).value).toBe('80')
    expect((screen.getByLabelText('Altura (mm)') as HTMLInputElement).value).toBe('55')
    expect((screen.getByLabelText('Margem (mm)') as HTMLInputElement).value).toBe('2')
  })

  it('encaminha a alteração de cada dimensão', () => {
    const { onChange } = renderPanel()

    fireEvent.change(screen.getByLabelText('Largura (mm)'), { target: { value: '72' } })
    fireEvent.change(screen.getByLabelText('Altura (mm)'), { target: { value: '60' } })
    fireEvent.change(screen.getByLabelText('Margem (mm)'), { target: { value: '3' } })

    expect(onChange).toHaveBeenNthCalledWith(1, { widthMm: 72 })
    expect(onChange).toHaveBeenNthCalledWith(2, { heightMm: 60 })
    expect(onChange).toHaveBeenNthCalledWith(3, { marginMm: 3 })
  })

  it('marca o campo inválido e mostra a mensagem de erro', () => {
    renderPanel({ errors: { widthMm: 'Largura máxima de 80 mm.' } })

    expect(
      screen.getByLabelText(/^Largura/).getAttribute('aria-invalid'),
    ).toBe('true')
    expect(screen.getByRole('alert').textContent).toBe('Largura máxima de 80 mm.')
  })
})

describe('PrintSettingsPanel — modelo', () => {
  it('encaminha o modelo escolhido', async () => {
    const user = userEvent.setup()
    const { onChangePreset } = renderPanel()

    await user.selectOptions(screen.getByLabelText('Modelo'), 'compact')

    expect(onChangePreset).toHaveBeenCalledWith('compact')
  })
})

describe('PrintSettingsPanel — ações', () => {
  it('mantém "Salvar" desabilitado sem alterações pendentes', () => {
    renderPanel({ isDirty: false })

    expect(screen.getByRole('button', { name: /Salvar/i }).hasAttribute('disabled')).toBe(true)
  })

  it('avisa quando as configurações são salvas', async () => {
    const user = userEvent.setup()
    const { onSave } = renderPanel({ isDirty: true, onSave: () => true })

    await user.click(screen.getByRole('button', { name: /Salvar/i }))

    expect(onSave).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('status').textContent).toBe('Configurações salvas neste navegador.')
  })

  it('avisa quando a validação bloqueia o salvamento', async () => {
    const user = userEvent.setup()
    renderPanel({ isDirty: true, onSave: () => false })

    await user.click(screen.getByRole('button', { name: /Salvar/i }))

    expect(screen.getByRole('status').textContent).toBe('Revise os valores antes de salvar.')
  })

  it('restaura as dimensões padrão', async () => {
    const user = userEvent.setup()
    const { onRestoreDefault } = renderPanel()

    await user.click(screen.getByRole('button', { name: /Restaurar padrão/i }))

    expect(onRestoreDefault).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('status').textContent).toBe('Dimensões padrão restauradas.')
  })
})
