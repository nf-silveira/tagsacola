import { FiClock, FiCopy, FiEdit2, FiPrinter, FiTrash2 } from 'react-icons/fi'

import { countBags, type LabelBatch } from '@/domain/label'

import styles from './HistoryTable.module.css'

interface HistoryTableProps {
  batches: LabelBatch[]
  onReprint: (batch: LabelBatch) => void
  onEdit: (batch: LabelBatch) => void
  onDuplicate: (batch: LabelBatch) => void
  onDelete: (batch: LabelBatch) => void
  onClearHistory: () => void
}

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

export function HistoryTable({
  batches,
  onReprint,
  onEdit,
  onDuplicate,
  onDelete,
  onClearHistory,
}: HistoryTableProps) {
  const hasBatches = batches.length > 0

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
              {batches.map((batch) => (
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
                        className={`${styles.actionButton} ${styles.duplicateButton}`}
                        onClick={() => onDuplicate(batch)}
                      >
                        <FiCopy aria-hidden="true" />
                        Duplicar
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
          Nenhuma etiqueta gerada ainda. As compras geradas aparecem aqui, salvas
          neste computador.
        </p>
      )}
    </section>
  )
}
