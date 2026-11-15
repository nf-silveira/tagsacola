import type { ChangeEvent } from 'react'
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
import { PAGE_SIZE_OPTIONS, formatBatchDateTime, type PageSize } from '@/domain/history'
import { useHistoryView } from '@/hooks/useHistoryView'

import styles from './HistoryTable.module.css'

interface HistoryTableProps {
  batches: LabelBatch[]
  onReprint: (batch: LabelBatch) => void
  onEdit: (batch: LabelBatch) => void
  onDelete: (batch: LabelBatch) => void
  onClearHistory: () => void
}

export function HistoryTable({
  batches,
  onReprint,
  onEdit,
  onDelete,
  onClearHistory,
}: HistoryTableProps) {
  const hasBatches = batches.length > 0
  const {
    searchTerm,
    pageSize,
    filteredCount,
    currentPage,
    totalPages,
    firstItemIndex,
    visibleBatches,
    pageItems,
    changeSearchTerm,
    changePageSize,
    goToPage,
  } = useHistoryView(batches)

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    changeSearchTerm(event.target.value)
  }

  function handlePageSizeChange(event: ChangeEvent<HTMLSelectElement>) {
    changePageSize(Number(event.target.value) as PageSize)
  }

  if (!hasBatches) {
    return (
      <section className={styles.panel} aria-labelledby="history-title">
        <div className={styles.panelHeader}>
          <FiClock aria-hidden="true" />
          <h2 id="history-title" className={styles.panelTitle}>
            Últimas Etiquetas Geradas
          </h2>
        </div>

        <p className={styles.emptyState}>
          Nenhuma etiqueta gerada ainda. As compras geradas aparecem aqui, salvas
          neste computador.
        </p>
      </section>
    )
  }

  return (
    <section className={styles.panel} aria-labelledby="history-title">
      <div className={styles.panelHeader}>
        <FiClock aria-hidden="true" />
        <h2 id="history-title" className={styles.panelTitle}>
          Últimas Etiquetas Geradas
        </h2>

        <button type="button" className={styles.clearButton} onClick={onClearHistory}>
          Limpar histórico
        </button>
      </div>

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
          {filteredCount === 0
            ? 'Nenhum resultado'
            : `Mostrando ${firstItemIndex + 1}–${firstItemIndex + visibleBatches.length} de ${filteredCount}`}
        </p>

        <div className={styles.pageControls}>
          <button
            type="button"
            className={styles.pageButton}
            onClick={() => goToPage(currentPage - 1)}
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
                  onClick={() => goToPage(item)}
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
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Próxima página"
          >
            <FiChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  )
}
