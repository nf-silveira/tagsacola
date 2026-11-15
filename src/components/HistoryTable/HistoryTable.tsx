import { useMemo, useState, type ChangeEvent } from 'react'
import {
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiEdit2,
  FiPrinter,
  FiSearch,
  FiTrash2,
} from 'react-icons/fi'

import { countBags, type LabelBatch } from '@/domain/label'

import styles from './HistoryTable.module.css'

interface HistoryTableProps {
  batches: LabelBatch[]
  onReprint: (batch: LabelBatch) => void
  onEdit: (batch: LabelBatch) => void
  onDelete: (batch: LabelBatch) => void
  onClearHistory: () => void
}

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50] as const

type PageSize = (typeof PAGE_SIZE_OPTIONS)[number]

function formatBatchDateTime(batch: LabelBatch): string {
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

/** Busca sem diferenciar maiúsculas nem acentos ("joao" encontra "João"). */
function normalizeSearchValue(value: string): string {
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

type PageItem = number | 'gap-start' | 'gap-end'

/** Atalhos numerados: primeiro, último e vizinhos da página atual, com "…" nos intervalos. */
function getPageItems(currentPage: number, totalPages: number): PageItem[] {
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

export function HistoryTable({
  batches,
  onReprint,
  onEdit,
  onDelete,
  onClearHistory,
}: HistoryTableProps) {
  const hasBatches = batches.length > 0
  const [searchTerm, setSearchTerm] = useState('')
  const [pageSize, setPageSize] = useState<PageSize>(PAGE_SIZE_OPTIONS[0])
  const [page, setPage] = useState(1)

  const filteredBatches = useMemo(() => {
    const normalizedTerm = normalizeSearchValue(searchTerm.trim())

    return normalizedTerm === ''
      ? batches
      : batches.filter((batch) => matchesSearch(batch, normalizedTerm))
  }, [batches, searchTerm])

  const totalPages = Math.max(1, Math.ceil(filteredBatches.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const firstItemIndex = (currentPage - 1) * pageSize
  const visibleBatches = filteredBatches.slice(firstItemIndex, firstItemIndex + pageSize)
  const pageItems = getPageItems(currentPage, totalPages)

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    setSearchTerm(event.target.value)
    setPage(1)
  }

  function handlePageSizeChange(event: ChangeEvent<HTMLSelectElement>) {
    setPageSize(Number(event.target.value) as PageSize)
    setPage(1)
  }

  return (
    <section className={styles.panel} aria-labelledby="history-title">
      <div className={styles.panelHeader}>
        <FiClock aria-hidden="true" />
        <h2 id="history-title" className={styles.panelTitle}>
          Últimas Etiquetas Geradas
        </h2>

        {hasBatches && (
          <button type="button" className={styles.clearButton} onClick={onClearHistory}>
            Limpar histórico
          </button>
        )}
      </div>

      {hasBatches ? (
        <>
          <div className={styles.toolbar}>
            <label className={styles.searchField}>
              <FiSearch aria-hidden="true" />
              <input
                type="search"
                className={`form-control form-control-sm ${styles.searchInput}`}
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Buscar por nº da compra ou cliente"
                aria-label="Buscar etiquetas no histórico"
              />
            </label>
          </div>

          {visibleBatches.length > 0 ? (
            <div className={styles.tableWrapper}>
              <table className={`table align-middle mb-0 ${styles.table}`}>
                <thead>
                  <tr>
                    <th scope="col">Pedido</th>
                    <th scope="col">Cliente</th>
                    <th scope="col">Data e hora</th>
                    <th scope="col">Total</th>
                    <th scope="col" className={styles.actionsColumn}>
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleBatches.map((batch) => (
                    <tr key={batch.id}>
                      <td className={styles.purchaseNumber}>
                        {batch.purchaseNumber ?? 'Sem identificação'}
                      </td>
                      <td>{batch.customerName ?? 'Cliente não informado'}</td>
                      <td>{formatBatchDateTime(batch)}</td>
                      <td className={styles.total}>{countBags(batch.quantities)} sacolas</td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            type="button"
                            className={`${styles.actionButton} ${styles.reprintButton}`}
                            onClick={() => onReprint(batch)}
                          >
                            <FiPrinter aria-hidden="true" />
                            Reimprimir
                          </button>

                          <button
                            type="button"
                            className={`${styles.actionButton} ${styles.editButton}`}
                            onClick={() => onEdit(batch)}
                          >
                            <FiEdit2 aria-hidden="true" />
                            Editar
                          </button>

                          <button
                            type="button"
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            onClick={() => onDelete(batch)}
                          >
                            <FiTrash2 aria-hidden="true" />
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={styles.emptyState}>
              Nenhuma etiqueta encontrada para a busca informada.
            </p>
          )}

          <div className={styles.pagination}>
            <label className={styles.pageSizeField}>
              Mostrar
              <select
                className={`form-select form-select-sm ${styles.pageSizeSelect}`}
                value={pageSize}
                onChange={handlePageSizeChange}
                aria-label="Itens por página"
              >
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              por página
            </label>

            <p className={styles.rangeInfo}>
              {filteredBatches.length === 0
                ? 'Nenhum resultado'
                : `Mostrando ${firstItemIndex + 1}–${firstItemIndex + visibleBatches.length} de ${filteredBatches.length}`}
            </p>

            <div className={styles.pageControls}>
              <button
                type="button"
                className={styles.pageButton}
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Página anterior"
              >
                <FiChevronLeft aria-hidden="true" />
              </button>

              <div className={styles.pageList}>
                {pageItems.map((item) =>
                  typeof item === 'number' ? (
                    <button
                      key={item}
                      type="button"
                      className={`${styles.pageNumber} ${
                        item === currentPage ? styles.pageNumberActive : ''
                      }`}
                      onClick={() => setPage(item)}
                      aria-label={`Página ${item}`}
                      aria-current={item === currentPage ? 'page' : undefined}
                    >
                      {item}
                    </button>
                  ) : (
                    <span key={item} className={styles.pageGap} aria-hidden="true">
                      …
                    </span>
                  ),
                )}
              </div>

              <button
                type="button"
                className={styles.pageButton}
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Próxima página"
              >
                <FiChevronRight aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <p className={styles.emptyState}>
          Nenhuma etiqueta gerada ainda. As compras geradas aparecem aqui, salvas
          neste computador.
        </p>
      )}
    </section>
  )
}
