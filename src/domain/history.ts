/**
 * Regras de busca, paginação e formatação do histórico de etiquetas.
 *
 * Puro, sem React e sem navegador: a tabela apenas renderiza o resultado.
 */

import type { LabelBatch } from '@/domain/label'

export const PAGE_SIZE_OPTIONS = [10, 20, 30, 50] as const

export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number]

export const DEFAULT_PAGE_SIZE: PageSize = PAGE_SIZE_OPTIONS[0]

export type PageItem = number | 'gap-start' | 'gap-end'

export interface Pagination {
  /** Página efetivamente exibida, sempre dentro de `1..totalPages`. */
  currentPage: number
  totalPages: number
  /** Índice do primeiro registro da página na lista filtrada. */
  firstItemIndex: number
  visibleBatches: LabelBatch[]
  pageItems: PageItem[]
}

/** Busca sem diferenciar maiúsculas nem acentos ("joao" encontra "João"). */
export function normalizeSearchValue(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

function matchesSearch(batch: LabelBatch, normalizedTerm: string): boolean {
  return [batch.purchaseNumber, batch.customerName].some(
    (field) => field !== null && normalizeSearchValue(field).includes(normalizedTerm),
  )
}

export function filterBatches(batches: LabelBatch[], searchTerm: string): LabelBatch[] {
  const normalizedTerm = normalizeSearchValue(searchTerm.trim())

  if (normalizedTerm === '') {
    return batches
  }

  return batches.filter((batch) => matchesSearch(batch, normalizedTerm))
}

/** Atalhos numerados: primeiro, último e vizinhos da página atual, com "…" nos intervalos. */
export function getPageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const firstNeighbor = Math.max(2, currentPage - 1)
  const lastNeighbor = Math.min(totalPages - 1, currentPage + 1)
  const items: PageItem[] = [1]

  if (firstNeighbor > 2) {
    items.push('gap-start')
  }

  for (let pageNumber = firstNeighbor; pageNumber <= lastNeighbor; pageNumber += 1) {
    items.push(pageNumber)
  }

  if (lastNeighbor < totalPages - 1) {
    items.push('gap-end')
  }

  items.push(totalPages)

  return items
}

/** Recorta a página pedida para o intervalo válido e devolve os registros visíveis. */
export function paginateBatches(
  batches: LabelBatch[],
  pageSize: PageSize,
  requestedPage: number,
): Pagination {
  const totalPages = Math.max(1, Math.ceil(batches.length / pageSize))
  const currentPage = Math.min(Math.max(requestedPage, 1), totalPages)
  const firstItemIndex = (currentPage - 1) * pageSize

  return {
    currentPage,
    totalPages,
    firstItemIndex,
    visibleBatches: batches.slice(firstItemIndex, firstItemIndex + pageSize),
    pageItems: getPageItems(currentPage, totalPages),
  }
}

/** "14/11/2026 às 07:45" | "14/11/2026" | data de criação, conforme o que foi informado. */
export function formatBatchDateTime(batch: LabelBatch): string {
  if (!batch.date) {
    return new Date(batch.createdAt).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  }

  const [year = '', month = '', day = ''] = batch.date.split('-')
  const datePart = `${day}/${month}/${year}`

  return batch.time ? `${datePart} às ${batch.time}` : datePart
}
