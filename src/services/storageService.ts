/**
 * Persistência local: preferências de impressão e histórico de etiquetas.
 *
 * Único ponto da aplicação que conhece `localStorage`. Cada chave é exposta como
 * um store externo observável (compatível com `useSyncExternalStore`), o que
 * evita ler o armazenamento durante a renderização no servidor.
 *
 * Nenhum dado sai do navegador do usuário.
 */

import { labelBatchSchema, MAX_HISTORY_ITEMS, type LabelBatch } from '@/domain/label'
import {
  DEFAULT_PRINT_SETTINGS,
  printSettingsSchema,
  type PrintSettings,
} from '@/domain/printSettings'
import { z } from 'zod'

const PRINT_SETTINGS_KEY = 'tag-sacola:print-settings:v1'
const LABEL_HISTORY_KEY = 'tag-sacola:history:v1'

const labelHistorySchema = z.array(labelBatchSchema).max(MAX_HISTORY_ITEMS)

export interface LocalStore<T> {
  getSnapshot: () => T
  getServerSnapshot: () => T
  subscribe: (listener: () => void) => () => void
  set: (value: T) => void
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage
  } catch {
    return null
  }
}

function createLocalStore<T>(
  storageKey: string,
  parse: (value: unknown) => T | null,
  fallback: T,
): LocalStore<T> {
  const listeners = new Set<() => void>()
  let cachedSnapshot: T | null = null

  function readFromStorage(): T {
    const raw = getStorage()?.getItem(storageKey) ?? null

    if (!raw) {
      return fallback
    }

    try {
      return parse(JSON.parse(raw)) ?? fallback
    } catch {
      return fallback
    }
  }

  function getSnapshot(): T {
    cachedSnapshot ??= readFromStorage()
    return cachedSnapshot
  }

  function handleStorageChange(event: StorageEvent) {
    if (event.key !== storageKey) {
      return
    }

    cachedSnapshot = null
    getSnapshot()
    listeners.forEach((listener) => listener())
  }

  function subscribe(listener: () => void): () => void {
    if (listeners.size === 0) {
      window.addEventListener('storage', handleStorageChange)
    }

    listeners.add(listener)

    return () => {
      listeners.delete(listener)

      if (listeners.size === 0) {
        window.removeEventListener('storage', handleStorageChange)
      }
    }
  }

  function set(value: T): void {
    cachedSnapshot = value
    getStorage()?.setItem(storageKey, JSON.stringify(value))
    listeners.forEach((listener) => listener())
  }

  return {
    getSnapshot,
    getServerSnapshot: () => fallback,
    subscribe,
    set,
  }
}

export const labelHistoryStore = createLocalStore<LabelBatch[]>(
  LABEL_HISTORY_KEY,
  (value) => {
    const result = labelHistorySchema.safeParse(value)
    return result.success ? result.data : null
  },
  [],
)

export const printSettingsStore = createLocalStore<PrintSettings>(
  PRINT_SETTINGS_KEY,
  (value) => {
    const result = printSettingsSchema.safeParse(value)
    return result.success ? result.data : null
  },
  DEFAULT_PRINT_SETTINGS,
)
