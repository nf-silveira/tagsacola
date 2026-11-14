import { useSyncExternalStore } from 'react'

function subscribeToNetworkStatus(onChange: () => void): () => void {
  window.addEventListener('online', onChange)
  window.addEventListener('offline', onChange)

  return () => {
    window.removeEventListener('online', onChange)
    window.removeEventListener('offline', onChange)
  }
}

/** `true` quando o navegador está conectado. Assume online durante a renderização no servidor. */
export function useNetworkStatus(): boolean {
  return useSyncExternalStore(
    subscribeToNetworkStatus,
    () => navigator.onLine,
    () => true,
  )
}
