import { FiEye, FiPrinter } from 'react-icons/fi'

import { LabelNavigation } from '@/components/LabelNavigation/LabelNavigation'
import { PrintableLabel } from '@/components/PrintableLabel/PrintableLabel'
import type { LabelDraft } from '@/domain/label'
import type { PrintSettings } from '@/domain/printSettings'

import styles from './LabelPreview.module.css'

interface LabelPreviewProps {
  draft: LabelDraft
  totalBags: number
  settings: PrintSettings
  currentPage: number
  onChangePage: (page: number) => void
  onPrintTest: () => void
}

export function LabelPreview({
  draft,
  totalBags,
  settings,
  currentPage,
  onChangePage,
  onPrintTest,
}: LabelPreviewProps) {
  const hasLabels = totalBags > 0

  return (
    <section className={styles.panel} aria-labelledby="label-preview-title">
      <div className={styles.panelHeader}>
        <FiEye aria-hidden="true" />
        <h2 id="label-preview-title" className={styles.panelTitle}>
          Pré-visualização da Etiqueta
        </h2>

        <button type="button" className={styles.printTestButton} onClick={onPrintTest}>
          <FiPrinter aria-hidden="true" />
          Imprimir Teste
        </button>
      </div>

      <div className={styles.panelBody}>
        {hasLabels ? (
          <>
            <div className={styles.labelWrapper}>
              <PrintableLabel
                data={draft}
                position={currentPage}
                total={totalBags}
                settings={settings}
              />
            </div>

            <LabelNavigation
              currentPage={currentPage}
              total={totalBags}
              onChangePage={onChangePage}
            />
          </>
        ) : (
          <div className={styles.emptyState}>
            <FiEye aria-hidden="true" />
            <p className={styles.emptyTitle}>Nenhuma sacola informada</p>
            <p className={styles.emptyText}>
              Informe as quantidades por categoria para visualizar a etiqueta.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
