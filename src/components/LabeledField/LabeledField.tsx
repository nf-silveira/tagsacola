import type { ReactNode } from 'react'

import styles from './LabeledField.module.css'

interface LabeledFieldProps {
  label: string
  /** Layout do campo (grid, espaçamento), definido pelo formulário que o usa. */
  className?: string
  optional?: boolean
  error?: string
  children: ReactNode
}

/**
 * Rótulo de formulário com marcação opcional e mensagem de erro.
 *
 * Cuida apenas da aparência interna do rótulo/erro; o posicionamento no grid
 * continua sendo responsabilidade do componente pai, via `className`.
 */
export function LabeledField({
  label,
  className,
  optional = false,
  error,
  children,
}: LabeledFieldProps) {
  return (
    <label className={className}>
      <span className={styles.label}>
        {label}
        {optional && (
          <>
            {' '}
            <em className={styles.optional}>(opcional)</em>
          </>
        )}
      </span>

      {children}

      {error && (
        <span className={styles.error} role="alert">
          {error}
        </span>
      )}
    </label>
  )
}
