import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { createEmptyDraft } from '@/domain/label'
import { DEFAULT_PRINT_SETTINGS } from '@/domain/printSettings'

import { LabelPreview } from './LabelPreview'

const DRAFT = {
  ...createEmptyDraft(),
  purchaseNumber: '2026',
  customerName: 'Aline Chaves',
  date: '2026-11-14',
  time: '07:45',
  quantities: { dry: 2, refrigerated: 1, frozen: 0, pack: 1 },
}

interface RenderPreviewProps {
  totalBags?: number
  currentPage?: number
}

function renderPreview({ totalBags = 4, currentPage = 1 }: RenderPreviewProps = {}) {
  const onChangePage = vi.fn()
  const onPrintTest = vi.fn()

  render(
    <LabelPreview
      draft={DRAFT}
      totalBags={totalBags}
      settings={DEFAULT_PRINT_SETTINGS}
      currentPage={currentPage}
      onChangePage={onChangePage}
      onPrintTest={onPrintTest}
    />,
  )

  return { onChangePage, onPrintTest }
}

describe('LabelPreview — estado vazio', () => {
  it('pede as quantidades quando não há sacolas', () => {
    renderPreview({ totalBags: 0 })

    expect(screen.getByText('Nenhuma sacola informada')).toBeDefined()
    expect(screen.queryByRole('button', { name: 'Próxima etiqueta' })).toBeNull()
  })

  it('mantém a impressão de teste disponível', async () => {
    const user = userEvent.setup()
    const { onPrintTest } = renderPreview({ totalBags: 0 })

    await user.click(screen.getByRole('button', { name: /Imprimir Teste/i }))

    expect(onPrintTest).toHaveBeenCalledTimes(1)
  })
})

describe('LabelPreview — pré-visualização', () => {
  it('mostra a posição atual da etiqueta', () => {
    renderPreview({ totalBags: 4, currentPage: 2 })

    // A etiqueta e o contador de navegação mostram a mesma sequência.
    expect(screen.getAllByText(/2 de 4/)).toHaveLength(2)
    expect(screen.getByText('Aline Chaves')).toBeDefined()
    expect(screen.getByText('2026')).toBeDefined()
  })

  it('desabilita os controles nos limites', () => {
    renderPreview({ totalBags: 4, currentPage: 1 })

    expect(
      screen.getByRole('button', { name: 'Primeira etiqueta' }).hasAttribute('disabled'),
    ).toBe(true)
    expect(
      screen.getByRole('button', { name: 'Etiqueta anterior' }).hasAttribute('disabled'),
    ).toBe(true)
    expect(
      screen.getByRole('button', { name: 'Última etiqueta' }).hasAttribute('disabled'),
    ).toBe(false)
  })

  it('navega para primeira, anterior, próxima e última', async () => {
    const user = userEvent.setup()
    const { onChangePage } = renderPreview({ totalBags: 4, currentPage: 2 })

    await user.click(screen.getByRole('button', { name: 'Primeira etiqueta' }))
    await user.click(screen.getByRole('button', { name: 'Etiqueta anterior' }))
    await user.click(screen.getByRole('button', { name: 'Próxima etiqueta' }))
    await user.click(screen.getByRole('button', { name: 'Última etiqueta' }))

    expect(onChangePage.mock.calls).toEqual([[1], [1], [3], [4]])
  })
})
