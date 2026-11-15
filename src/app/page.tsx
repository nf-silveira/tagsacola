'use client'

import { useState } from 'react'
import { flushSync } from 'react-dom'

import { ConfirmDialog } from '@/components/ConfirmDialog/ConfirmDialog'
import {
  buildConfirmation,
  type PendingAction,
} from '@/components/ConfirmDialog/confirmationMessages'
import { Header } from '@/components/Header/Header'
import { HistoryTable } from '@/components/HistoryTable/HistoryTable'
import { Footer } from '@/components/Footer/Footer'
import { LabelPreview } from '@/components/LabelPreview/LabelPreview'
import { OrderForm } from '@/components/OrderForm/OrderForm'
import { PrintArea, type PrintTarget } from '@/components/PrintArea/PrintArea'
import { PrintSettingsPanel } from '@/components/PrintSettingsPanel/PrintSettingsPanel'
import { countBags, createLabelBatch, type LabelBatch } from '@/domain/label'
import { useLabelDraft } from '@/hooks/useLabelDraft'
import { useLabelHistory } from '@/hooks/useLabelHistory'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { usePrintSettings } from '@/hooks/usePrintSettings'
import { printLabelSheet } from '@/services/printService'

import styles from './page.module.css'

export default function Home() {
  const isOnline = useNetworkStatus()
  const {
    draft,
    setIdentificationField,
    setDeliveryMode,
    setQuantity,
    clearDraft,
    loadBatch,
  } = useLabelDraft()
  const { batches, addBatch, removeBatch, clearHistory } = useLabelHistory()
  const {
    settings,
    errors,
    isDirty,
    changeSettings,
    changePreset,
    saveSettings,
    restoreDefault,
  } = usePrintSettings()

  const totalBags = countBags(draft.quantities)
  const [activePage, setActivePage] = useState(1)
  const [printTarget, setPrintTarget] = useState<PrintTarget>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)

  const currentPage = Math.min(Math.max(activePage, 1), Math.max(totalBags, 1))

  /** Monta a área imprimível, abre o diálogo de impressão e limpa a área. */
  function printLabels(target: Exclude<PrintTarget, null>) {
    flushSync(() => setPrintTarget(target))
    printLabelSheet()
    setPrintTarget(null)
  }

  function handleGenerateLabels() {
    if (totalBags === 0) {
      return
    }

    addBatch(createLabelBatch(draft))
    setActivePage(1)
    printLabels('labels')
  }

  function handleLoadBatch(batch: LabelBatch) {
    loadBatch(batch)
    setActivePage(1)
  }

  function handleEditBatch(batch: LabelBatch) {
    handleLoadBatch(batch)
    document
      .getElementById('nova-etiqueta')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  function handleReprintBatch(batch: LabelBatch) {
    handleLoadBatch(batch)
    printLabels('labels')
  }

  function handleDeleteBatch(batch: LabelBatch) {
    setPendingAction({ type: 'delete', batch })
  }

  function handleClearHistory() {
    setPendingAction({ type: 'clear' })
  }

  function handleConfirmPendingAction() {
    if (pendingAction === null) {
      return
    }

    if (pendingAction.type === 'delete') {
      removeBatch(pendingAction.batch.id)
    } else {
      clearHistory()
    }

    setPendingAction(null)
  }

  const confirmation = buildConfirmation(pendingAction, batches.length)

  return (
    <>
      <div id="topo" className={`app-shell ${styles.shell}`}>
        <Header isOnline={isOnline} />

        <main className={styles.main}>
          <div className={styles.columns}>
            <div id="nova-etiqueta">
              <OrderForm
                draft={draft}
                totalBags={totalBags}
                onChangeField={setIdentificationField}
                onChangeDeliveryMode={setDeliveryMode}
                onChangeQuantity={setQuantity}
                onGenerate={handleGenerateLabels}
                onClear={clearDraft}
              />
            </div>

            <div className={styles.sidebar}>
              <LabelPreview
                draft={draft}
                totalBags={totalBags}
                settings={settings}
                currentPage={currentPage}
                onChangePage={setActivePage}
                onPrintTest={() => printLabels('test')}
              />

              <div id="print-settings">
                <PrintSettingsPanel
                  settings={settings}
                  errors={errors}
                  isDirty={isDirty}
                  onChange={changeSettings}
                  onChangePreset={changePreset}
                  onSave={saveSettings}
                  onRestoreDefault={restoreDefault}
                />
              </div>
            </div>
          </div>

          <HistoryTable
            batches={batches}
            onReprint={handleReprintBatch}
            onEdit={handleEditBatch}
            onDelete={handleDeleteBatch}
            onClearHistory={handleClearHistory}
          />
        </main>

        <Footer />
      </div>

      <ConfirmDialog
        open={pendingAction !== null}
        title={confirmation?.title ?? ''}
        description={confirmation?.description ?? ''}
        confirmLabel={confirmation?.confirmLabel ?? 'Confirmar'}
        onConfirm={handleConfirmPendingAction}
        onCancel={() => setPendingAction(null)}
      />

      <PrintArea
        target={printTarget}
        draft={draft}
        totalBags={totalBags}
        settings={settings}
      />
    </>
  )
}
