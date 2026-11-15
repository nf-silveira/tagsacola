import { useState } from 'react'
import { FiInfo, FiTag } from 'react-icons/fi'

import { StatusIndicator } from '@/components/StatusIndicator/StatusIndicator'

import styles from './Header.module.css'

interface HeaderProps {
  isOnline: boolean
}

export function Header({ isOnline }: HeaderProps) {
  const [isInfoOpen, setIsInfoOpen] = useState(false)

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.logo} aria-hidden="true">
          <FiTag size={26} />
        </span>

        <div className={styles.brandText}>
          <p className={styles.name}>Tag Sacola</p>
          <p className={styles.subtitle}>etiqueta fácil</p>
        </div>

        <p className={styles.slogan}>
          Sua solução de etiquetas sempre que tiver B.O na operação 🚨
        </p>
      </div>

      <div className={styles.actions}>
        <StatusIndicator isOnline={isOnline} />

        <button
          type="button"
          className={styles.infoButton}
          onClick={() => setIsInfoOpen((isOpen) => !isOpen)}
          aria-expanded={isInfoOpen}
          aria-controls="app-info"
        >
          <FiInfo aria-hidden="true" />
          <span className="visually-hidden">Informações do sistema</span>
        </button>
      </div>

      {isInfoOpen && (
        <div id="app-info" className={styles.infoPanel}>
          <p className={styles.infoTitle}>Sobre o Tag Sacola</p>
          <p className={styles.infoText}>
            Ferramenta de contingência para gerar e imprimir etiquetas de sacolas.
            Nenhum dado de cliente sai deste computador: histórico e configurações
            ficam salvos no próprio navegador.
          </p>
          <ul className={styles.infoList}>
            <li>Impressora de referência: Sweda SI-300</li>
            <li>Bobina térmica adesiva contínua de 80 mm (72 mm imprimíveis)</li>
            <li>Corte automático realizado pela impressora</li>
          </ul>
        </div>
      )}
    </header>
  )
}
