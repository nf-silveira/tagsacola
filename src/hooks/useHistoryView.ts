import { useCallback, useMemo, useState } from 'react'

import type { LabelBatch } from '@/domain/label'
import {
  DEFAULT_PAGE_SIZE,
  filterBatches,
  paginateBatches,
  type PageSize,
  type Pagination,
} from '@/domain/history'

interface UseHistoryViewResult extends Pagination {
  searchTerm: string
  pageSize: PageSize
  /** Total de registros depois da busca. */
  filteredCount: number
  changeSearchTerm: (value: string) => void
  changePageSize: (pageSize: PageSize) => void
  goToPage: (page: number) => void
}

/**
 * Estado de busca e paginação do histórico.
 *
 * Mantém os cálculos fora do componente visual: qualquer mudança de busca ou de
 * tamanho de página volta para a primeira página.
 */
export function useHistoryView(batches: LabelBatch[]): UseHistoryViewResult {
  const [searchTerm, setSearchTerm] = useState('')
  const [pageSize, setPageSize] = useState<PageSize>(DEFAULT_PAGE_SIZE)
  const [requestedPage, setRequestedPage] = useState(1)

  const filteredBatches = useMemo(
    () => filterBatches(batches, searchTerm),
    [batches, searchTerm],
  )

  const pagination = useMemo(
    () => paginateBatches(filteredBatches, pageSize, requestedPage),
    [filteredBatches, pageSize, requestedPage],
  )

  const changeSearchTerm = useCallback((value: string) => {
    setSearchTerm(value)
    setRequestedPage(1)
  }, [])

  const changePageSize = useCallback((value: PageSize) => {
    setPageSize(value)
    setRequestedPage(1)
  }, [])

  const goToPage = useCallback((page: number) => {
    setRequestedPage(page)
  }, [])

  return {
    ...pagination,
    searchTerm,
    pageSize,
    filteredCount: filteredBatches.length,
    changeSearchTerm,
    changePageSize,
    goToPage,
  }
}
