'use client'

import { useEffect, useRef, type MouseEvent } from 'react'
import { FiAlertTriangle } from 'react-icons/fi'

import styles from './ConfirmDialog.module.css'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Diálogo de confirmação para ações destrutivas.
 *
 * Usa o elemento nativo `<dialog>` com `showModal()`, que já oferece foco
 * preso no diálogo, fundo inerte e fechamento com Esc.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) {
      return
    }

    if (open && !dialog.open) {
      dialog.showModal()
      return
    }

    if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) {
      return
    }

    function handleCancel(event: Event) {
      event.preventDefault()
      onCancel()
    }

    dialog.addEventListener('cancel', handleCancel)

    return () => dialog.removeEventListener('cancel', handleCancel)
  }, [onCancel])

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) {
      onCancel()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      role="alertdialog"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      onClick={handleBackdropClick}
    >
      <div className={styles.content}>
        <span className={styles.icon} aria-hidden="true">
          <FiAlertTriangle />
        </span>

        <div>
          <h2 id="confirm-dialog-title" className={styles.title}>
            {title}
          </h2>
          <p id="confirm-dialog-description" className={styles.description}>
            {description}
          </p>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>
          {cancelLabel}
        </button>
        <button type="button" className={styles.confirmButton} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
