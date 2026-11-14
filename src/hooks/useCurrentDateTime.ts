import { useSyncExternalStore } from 'react'

import { formatDateInputValue, formatTimeInputValue } from '@/domain/label'

export interface CurrentDateTime {
  /** Valor no formato `yyyy-mm-dd`. */
  date: string
  /** Valor no formato `HH:mm`. */
  time: string
}

let cachedClock: CurrentDateTime | null = null
const listeners = new Set<() => void>()

function readClock(): CurrentDateTime {
  const now = new Date()

  return {
    date: formatDateInputValue(now),
    time: formatTimeInputValue(now),
  }
}

function getSnapshot(): CurrentDateTime {
  cachedClock ??= readClock()
  return cachedClock
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

/** Descarta o horário em cache e relê o relógio do computador. */
export function refreshCurrentDateTime(): void {
  cachedClock = readClock()
  listeners.forEach((listener) => listener())
}

/**
 * Data e horário atuais do computador. Retorna `null` durante a renderização no
 * servidor, evitando divergência na hidratação.
 */
export function useCurrentDateTime(): CurrentDateTime | null {
  return useSyncExternalStore<CurrentDateTime | null>(
    subscribe,
    getSnapshot,
    () => null,
  )
}
