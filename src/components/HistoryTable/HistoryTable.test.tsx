import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { LabelBatch } from '@/domain/label'

import { HistoryTable } from './HistoryTable'

function createBatch(index: number, overrides: Partial<LabelBatch> = {}): LabelBatch {
  const sequence = String(index).padStart(2, '0')

  return {
    id: `batch-${sequence}`,
    createdAt: '2026-11-14T10:00:00.000Z',
    purchaseNumber: `P-${sequence}`,
    customerName: `Cliente ${sequence}`,
    date: '2026-11-14',
    time: '08:00',
    deliveryMode: null,
    quantities: { dry: 1, refrigerated: 0, frozen: 0, pack: 0 },
    ...overrides,
  }
}

function createBatches(count: number): LabelBatch[] {
  return Array.from({ length: count }, (_, index) => createBatch(index + 1))
}

const noop = () => undefined

interface RenderTableProps {
  batches: LabelBatch[]
  onReprint?: (batch: LabelBatch) => void
  onEdit?: (batch: LabelBatch) => void
  onDelete?: (batch: LabelBatch) => void
  onClearHistory?: () => void
}

function renderTable({
  batches,
  onReprint = noop,
  onEdit = noop,
  onDelete = noop,
  onClearHistory = noop,
}: RenderTableProps) {
  return render(
    <HistoryTable
      batches={batches}
      onReprint={onReprint}
      onEdit={onEdit}
      onDelete={onDelete}
      onClearHistory={onClearHistory}
    />,
  )
}

/** Linhas visíveis, descontando o cabeçalho quando a tabela está na tela. */
function countRows(): number {
  const rows = screen.queryAllByRole('row')
  return rows.length === 0 ? 0 : rows.length - 1
}

describe('HistoryTable — estado vazio', () => {
  it('mostra a mensagem de histórico vazio sem busca nem paginação', () => {
    renderTable({ batches: [] })

    expect(screen.getByText(/Nenhuma etiqueta gerada ainda/i)).toBeDefined()
    expect(screen.queryByRole('searchbox')).toBeNull()
    expect(screen.queryByLabelText('Itens por página')).toBeNull()
    expect(screen.queryByRole('button', { name: /Limpar histórico/i })).toBeNull()
  })
})

describe('HistoryTable — busca', () => {
  it('filtra por cliente ignorando maiúsculas e acentos', async () => {
    const user = userEvent.setup()
    renderTable({
      batches: [
        createBatch(1, { customerName: 'João Álvares', purchaseNumber: '2026' }),
        createBatch(2, { customerName: 'Aline Chaves', purchaseNumber: '3041' }),
      ],
    })

    await user.type(screen.getByRole('searchbox'), 'joao')

    expect(screen.getByText('João Álvares')).toBeDefined()
    expect(screen.queryByText('Aline Chaves')).toBeNull()
    expect(screen.getByText(/Mostrando 1–1 de 1/)).toBeDefined()
  })

  it('filtra pelo número da compra', async () => {
    const user = userEvent.setup()
    renderTable({ batches: createBatches(3) })

    await user.type(screen.getByRole('searchbox'), 'P-02')

    expect(countRows()).toBe(1)
    expect(screen.getByText('P-02')).toBeDefined()
  })

  it('avisa quando nenhum registro corresponde à busca', async () => {
    const user = userEvent.setup()
    renderTable({ batches: createBatches(3) })

    await user.type(screen.getByRole('searchbox'), 'inexistente')

    expect(screen.getByText(/Nenhuma etiqueta encontrada para a busca informada/i)).toBeDefined()
    expect(screen.getByText('Nenhum resultado')).toBeDefined()
    expect(countRows()).toBe(0)
  })

  it('volta para a primeira página ao alterar a busca', async () => {
    const user = userEvent.setup()
    renderTable({ batches: createBatches(25) })

    await user.click(screen.getByRole('button', { name: 'Próxima página' }))
    expect(screen.getByText(/Mostrando 11–20 de 25/)).toBeDefined()

    await user.type(screen.getByRole('searchbox'), 'Cliente')

    expect(screen.getByText(/Mostrando 1–10 de 25/)).toBeDefined()
  })
})

describe('HistoryTable — paginação', () => {
  it('mostra a primeira página com o total de registros', () => {
    renderTable({ batches: createBatches(25) })

    expect(countRows()).toBe(10)
    expect(screen.getByText(/Mostrando 1–10 de 25/)).toBeDefined()
    expect(screen.getByText('P-01')).toBeDefined()
    expect(screen.queryByText('P-11')).toBeNull()
  })

  it('navega entre páginas pelos atalhos numerados', async () => {
    const user = userEvent.setup()
    renderTable({ batches: createBatches(25) })

    await user.click(screen.getByRole('button', { name: 'Página 3' }))

    expect(screen.getByText(/Mostrando 21–25 de 25/)).toBeDefined()
    expect(countRows()).toBe(5)
    expect(screen.getByRole('button', { name: 'Página 3' }).getAttribute('aria-current')).toBe(
      'page',
    )
  })

  it('desabilita a navegação nos limites', async () => {
    const user = userEvent.setup()
    renderTable({ batches: createBatches(25) })

    expect(
      screen.getByRole('button', { name: 'Página anterior' }).hasAttribute('disabled'),
    ).toBe(true)

    await user.click(screen.getByRole('button', { name: 'Página 3' }))

    expect(
      screen.getByRole('button', { name: 'Próxima página' }).hasAttribute('disabled'),
    ).toBe(true)
  })

  it('respeita o tamanho de página escolhido', async () => {
    const user = userEvent.setup()
    renderTable({ batches: createBatches(25) })

    await user.selectOptions(screen.getByLabelText('Itens por página'), '20')

    expect(countRows()).toBe(20)
    expect(screen.getByText(/Mostrando 1–20 de 25/)).toBeDefined()
  })
})

describe('HistoryTable — linhas e ações', () => {
  it('mostra os dados da etiqueta na linha', () => {
    const batch = createBatch(1, {
      purchaseNumber: '2026',
      customerName: 'Aline Chaves',
      date: '2026-11-14',
      time: '07:45',
      quantities: { dry: 2, refrigerated: 1, frozen: 0, pack: 1 },
    })

    renderTable({ batches: [batch] })

    expect(screen.getByText('2026')).toBeDefined()
    expect(screen.getByText('Aline Chaves')).toBeDefined()
    expect(screen.getByText('14/11/2026 às 07:45')).toBeDefined()
    expect(screen.getByText('4 sacolas')).toBeDefined()
  })

  it('encaminha a linha para cada ação', async () => {
    const user = userEvent.setup()
    const batch = createBatch(1)
    const onReprint = vi.fn()
    const onEdit = vi.fn()
    const onDelete = vi.fn()

    renderTable({ batches: [batch], onReprint, onEdit, onDelete })

    await user.click(screen.getByRole('button', { name: /Reimprimir/i }))
    await user.click(screen.getByRole('button', { name: /Editar/i }))
    await user.click(screen.getByRole('button', { name: /Excluir/i }))

    expect(onReprint).toHaveBeenCalledWith(batch)
    expect(onEdit).toHaveBeenCalledWith(batch)
    expect(onDelete).toHaveBeenCalledWith(batch)
  })

  it('pede a limpeza do histórico', async () => {
    const user = userEvent.setup()
    const onClearHistory = vi.fn()

    renderTable({ batches: createBatches(2), onClearHistory })

    await user.click(screen.getByRole('button', { name: /Limpar histórico/i }))

    expect(onClearHistory).toHaveBeenCalledTimes(1)
  })
})
