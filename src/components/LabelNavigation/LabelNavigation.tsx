import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from 'react-icons/fi'

import styles from './LabelNavigation.module.css'

interface LabelNavigationProps {
  /** Página atual, começando em 1. */
  currentPage: number
  total: number
  onChangePage: (page: number) => void
}

export function LabelNavigation({ currentPage, total, onChangePage }: LabelNavigationProps) {
  const isFirstPage = currentPage <= 1
  const isLastPage = currentPage >= total

  return (
    <div className={styles.navigation}>
      <button
        type="button"
        className={styles.navButton}
        onClick={() => onChangePage(1)}
        disabled={isFirstPage}
        aria-label="Primeira etiqueta"
      >
        <FiChevronsLeft aria-hidden="true" />
      </button>

      <button
        type="button"
        className={styles.navButton}
        onClick={() => onChangePage(currentPage - 1)}
        disabled={isFirstPage}
        aria-label="Etiqueta anterior"
      >
        <FiChevronLeft aria-hidden="true" />
      </button>

      <p className={styles.counter}>
        {currentPage} de {total}
      </p>

      <button
        type="button"
        className={styles.navButton}
        onClick={() => onChangePage(currentPage + 1)}
        disabled={isLastPage}
        aria-label="Próxima etiqueta"
      >
        <FiChevronRight aria-hidden="true" />
      </button>

      <button
        type="button"
        className={styles.navButton}
        onClick={() => onChangePage(total)}
        disabled={isLastPage}
        aria-label="Última etiqueta"
      >
        <FiChevronsRight aria-hidden="true" />
      </button>
    </div>
  )
}
