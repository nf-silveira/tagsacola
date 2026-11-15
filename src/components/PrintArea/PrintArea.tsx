import { PrintableLabel } from '@/components/PrintableLabel/PrintableLabel'
import { countBags, type LabelDraft } from '@/domain/label'
import type { PrintSettings } from '@/domain/printSettings'

export type PrintTarget = 'labels' | 'test' | null

const TEST_LABEL: LabelDraft = {
  purchaseNumber: null,
  customerName: 'Etiqueta de teste',
  date: null,
  time: null,
  deliveryMode: null,
  quantities: { dry: 1, refrigerated: 1, frozen: 1, pack: 1 },
}

interface PrintAreaProps {
  target: PrintTarget
  draft: LabelDraft
  totalBags: number
  settings: PrintSettings
}

/**
 * Área que só aparece no papel (`.print-area` em `styles/print.css`).
 * É montada de forma síncrona antes de abrir o diálogo de impressão.
 */
export function PrintArea({ target, draft, totalBags, settings }: PrintAreaProps) {
  if (target === null) {
    return null
  }

  if (target === 'test') {
    const testTotal = countBags(TEST_LABEL.quantities)

    return (
      <div className="print-area" aria-hidden="true">
        <PrintableLabel
          data={TEST_LABEL}
          position={1}
          total={testTotal}
          settings={settings}
        />
      </div>
    )
  }

  return (
    <div className="print-area" aria-hidden="true">
      {Array.from({ length: totalBags }, (_, index) => (
        <PrintableLabel
          key={`label-${index + 1}`}
          data={draft}
          position={index + 1}
          total={totalBags}
          settings={settings}
        />
      ))}
    </div>
  )
}
