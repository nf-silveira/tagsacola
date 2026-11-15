import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { countBags } from '@/domain/label'
import { useLabelDraft } from '@/hooks/useLabelDraft'

import { OrderForm } from './OrderForm'

function OrderFormHarness() {
  const {
    draft,
    setIdentificationField,
    setDeliveryMode,
    setQuantity,
    clearDraft,
  } = useLabelDraft()

  return (
    <OrderForm
      draft={draft}
      totalBags={countBags(draft.quantities)}
      onChangeField={setIdentificationField}
      onChangeDeliveryMode={setDeliveryMode}
      onChangeQuantity={setQuantity}
      onGenerate={() => undefined}
      onClear={clearDraft}
    />
  )
}

describe('OrderForm', () => {
  it('mantém "Gerar Etiquetas" desabilitado com total zero', () => {
    render(<OrderFormHarness />)

    const generateButton = screen.getByRole('button', { name: /Gerar Etiquetas/i })
    expect(generateButton.hasAttribute('disabled')).toBe(true)
  })

  it('atualiza o total e habilita a geração ao aumentar uma categoria', async () => {
    const user = userEvent.setup()
    render(<OrderFormHarness />)

    await user.click(screen.getByRole('button', { name: 'Aumentar secas' }))

    expect(screen.getByText(/Total de sacolas/).textContent).toContain('1')
    const generateButton = screen.getByRole('button', { name: /Gerar Etiquetas/i })
    expect(generateButton.hasAttribute('disabled')).toBe(false)
  })

  it('não permite diminuir abaixo de zero', () => {
    render(<OrderFormHarness />)

    const decrementButton = screen.getByRole('button', { name: 'Diminuir secas' })
    expect(decrementButton.hasAttribute('disabled')).toBe(true)
  })

  it('preenche data e horário com o relógio do computador', () => {
    render(<OrderFormHarness />)

    expect((screen.getByLabelText(/^Data/) as HTMLInputElement).value).toMatch(
      /^\d{4}-\d{2}-\d{2}$/,
    )
    expect((screen.getByLabelText(/^Horário/) as HTMLInputElement).value).toMatch(
      /^\d{2}:\d{2}$/,
    )
  })

  it('permite personalizar a data e limpar o formulário', async () => {
    const user = userEvent.setup()
    render(<OrderFormHarness />)

    const nameInput = screen.getByLabelText(/Nome do cliente/i) as HTMLInputElement
    await user.type(nameInput, 'Fulano da Silva')
    await user.click(screen.getByRole('button', { name: 'Aumentar congeladas' }))

    expect(nameInput.value).toBe('Fulano da Silva')
    expect(screen.getByText(/Total de sacolas/).textContent).toContain('1')

    await user.click(screen.getByRole('button', { name: /Limpar/i }))

    expect(nameInput.value).toBe('')
    expect(screen.getByText(/Total de sacolas/).textContent).toContain('0')
  })
})
