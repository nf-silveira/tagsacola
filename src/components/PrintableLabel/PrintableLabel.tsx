import { FaBagShopping } from 'react-icons/fa6'

import { BAG_CATEGORY_ICONS } from '@/components/bagCategoryIcons'
import {
  BAG_CATEGORIES,
  DELIVERY_MODE_LABELS,
  formatLabelDateTime,
  formatQuantityLabel,
  type LabelDraft,
} from '@/domain/label'
import type { PrintSettings } from '@/domain/printSettings'

import styles from './PrintableLabel.module.css'

interface PrintableLabelProps {
  data: LabelDraft
  /** Posição da sacola na sequência (1-based). */
  position: number
  total: number
  settings: PrintSettings
}

export function PrintableLabel({ data, position, total, settings }: PrintableLabelProps) {
  const dateTime = formatLabelDateTime(data.date, data.time)
  const filledCategories = BAG_CATEGORIES.filter(
    (category) => data.quantities[category] > 0,
  )

  const labelStyle = {
    width: `${settings.widthMm}mm`,
    height: `${settings.heightMm}mm`,
    padding: `${settings.marginMm}mm`,
  }

  return (
    <article className={styles.label} style={labelStyle}>
      <header className={styles.header}>
        {data.purchaseNumber && (
          <div className={styles.purchaseCell}>
            <span className={styles.purchaseNumber}>{data.purchaseNumber}</span>
          </div>
        )}

        {dateTime && (
          <div className={styles.cell}>
            <span className={styles.cellLabel}>Data e hora</span>
            <span className={styles.cellValue}>{dateTime}</span>
          </div>
        )}

        {data.deliveryMode && (
          <div className={styles.cell}>
            <span className={styles.cellLabel}>Entrega</span>
            <span className={styles.cellValue}>
              {DELIVERY_MODE_LABELS[data.deliveryMode]}
            </span>
          </div>
        )}
      </header>

      <div className={styles.body}>
        {data.customerName && (
          <div className={styles.customer}>
            <span className={styles.cellLabel}>Cliente</span>
            <span className={styles.customerName}>{data.customerName}</span>
          </div>
        )}

        <div className={styles.bags}>
          <span className={styles.cellLabel}>Sacolas</span>
          <span className={styles.bagsValue}>
            <FaBagShopping aria-hidden="true" />
            {position} de {total}
          </span>
        </div>
      </div>

      {filledCategories.length > 0 && (
        <footer className={styles.summary}>
          {filledCategories.map((category) => {
            const Icon = BAG_CATEGORY_ICONS[category]
            const isOutlined = category === 'dry' || category === 'pack'

            return (
              <span
                key={category}
                className={`${styles.chip} ${isOutlined ? styles.outlinedChip : ''}`}
              >
                <Icon className={styles.chipIcon} aria-hidden="true" />
                {formatQuantityLabel(category, data.quantities[category])}
              </span>
            )
          })}
        </footer>
      )}
    </article>
  )
}
