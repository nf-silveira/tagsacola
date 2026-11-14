import { FiWifi, FiWifiOff } from 'react-icons/fi'

import styles from './StatusIndicator.module.css'

interface StatusIndicatorProps {
  isOnline: boolean
}

export function StatusIndicator({ isOnline }: StatusIndicatorProps) {
  return (
    <span
      className={`${styles.indicator} ${isOnline ? styles.online : styles.offline}`}
      role="status"
    >
      {isOnline ? <FiWifi aria-hidden="true" /> : <FiWifiOff aria-hidden="true" />}
      {isOnline ? 'Online' : 'Offline'}
    </span>
  )
}
