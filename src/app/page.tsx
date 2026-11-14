'use client'

import { useState } from 'react'
import { flushSync } from 'react-dom'

import { Header } from '@/components/Header/Header'
import { HistoryTable } from '@/components/HistoryTable/HistoryTable'
import { LabelPreview } from '@/components/LabelPreview/LabelPreview'
import { OrderForm } from '@/components/OrderForm/OrderForm'
import { PrintSettingsPanel } from '@/components/PrintSettingsPanel/PrintSettingsPanel'
import { PrintableLabel } from '@/components/PrintableLabel/PrintableLabel'
import {
  countBags,
  createLabelBatch,
  type LabelBatch,
  type LabelDraft,
} from '@/domain/label'
import { useLabelDraft } from '@/hooks/useLabelDraft'
import { useLabelHistory } from '@/hooks/useLabelHistory'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { usePrintSettings } from '@/hooks/usePrintSettings'
import { printLabelSheet } from '@/services/printService'

import styles from './page.module.css'

const TEST_LABEL: LabelDraft = {
  purchaseNumber: null,
  customerName: 'Etiqueta de teste',
  date: null,
  time: null,
  deliveryMode: null,
  quantities: { dry: 1, refrigerated: 1, frozen: 1, pack: 1 },
}

type PrintTarget = 'labels' | 'test' | null

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

  const currentPage = Math.min(Math.max(activePage, 1), Math.max(totalBags, 1))
  const lastBatch = batches[0]

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
  }

  function handleDuplicateLast() {
    if (!lastBatch) {
      return
    }

    loadBatch(lastBatch)
    setActivePage(1)
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
    const confirmed = window.confirm('Excluir esta etiqueta do histórico?')
    if (confirmed) {
      removeBatch(batch.id)
    }
  }

  function handleClearHistory() {
    const confirmed = window.confirm('Limpar todo o histórico de etiquetas?')
    if (confirmed) {
      clearHistory()
    }
  }

  function handleOpenSettings() {
    document
      .getElementById('print-settings')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <>
      <div className={`app-shell ${styles.shell}`}>
        <Header isOnline={isOnline} onOpenSettings={handleOpenSettings} />

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
                onDuplicateLast={handleDuplicateLast}
                canDuplicateLast={Boolean(lastBatch)}
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
            onDuplicate={handleLoadBatch}
            onDelete={handleDeleteBatch}
            onClearHistory={handleClearHistory}
          />
        </main>

        <footer className={styles.footer}>
          <p>Tag Sacola · Desenvolvido por Nelson Felipe</p>
        </footer>
      </div>

      <div className="print-area" aria-hidden="true">
        {printTarget === 'test' && (
          <PrintableLabel
            data={TEST_LABEL}
            position={1}
            total={countBags(TEST_LABEL.quantities)}
            settings={settings}
          />
        )}

        {printTarget === 'labels' &&
          Array.from({ length: totalBags }, (_, index) => (
            <PrintableLabel
              key={`label-${index + 1}`}
              data={draft}
              position={index + 1}
              total={totalBags}
              settings={settings}
            />
          ))}
      </div>
    </>
  )
}
