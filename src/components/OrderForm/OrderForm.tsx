import type { ChangeEvent } from 'react'
import { FaBagShopping, FaBroom, FaCartShopping } from 'react-icons/fa6'
import { FiPrinter } from 'react-icons/fi'

import { LabeledField } from '@/components/LabeledField/LabeledField'
import { QuantityCard } from '@/components/QuantityCard/QuantityCard'
import type { IdentificationField } from '@/hooks/useLabelDraft'
import {
  BAG_CATEGORIES,
  DELIVERY_MODES,
  DELIVERY_MODE_LABELS,
  type BagCategory,
  type DeliveryMode,
  type LabelDraft,
} from '@/domain/label'

import styles from './OrderForm.module.css'

interface OrderFormProps {
  draft: LabelDraft
  totalBags: number
  onChangeField: (field: IdentificationField, value: string) => void
  onChangeDeliveryMode: (mode: DeliveryMode) => void
  onChangeQuantity: (category: BagCategory, quantity: number) => void
  onGenerate: () => void
  onClear: () => void
}

export function OrderForm({
  draft,
  totalBags,
  onChangeField,
  onChangeDeliveryMode,
  onChangeQuantity,
  onGenerate,
  onClear,
}: OrderFormProps) {
  function createFieldHandler(field: IdentificationField) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      onChangeField(field, event.target.value)
    }
  }

  return (
    <section className={styles.panel} aria-labelledby="order-form-title">
      <div className={styles.panelHeader}>
        <FaCartShopping aria-hidden="true" />
        <h2 id="order-form-title" className={styles.panelTitle}>
          Nova Etiqueta
        </h2>
      </div>

      <div className={styles.panelBody}>
        <div className={styles.fields}>
          <LabeledField label="Número da compra" optional className={styles.field}>
            <input
              type="text"
              className={`form-control form-control-sm ${styles.input}`}
              inputMode="numeric"
              value={draft.purchaseNumber ?? ''}
              onChange={createFieldHandler('purchaseNumber')}
              placeholder="2026"
            />
          </LabeledField>

          <LabeledField label="Nome do cliente" optional className={styles.field}>
            <input
              type="text"
              className={`form-control form-control-sm ${styles.input}`}
              value={draft.customerName ?? ''}
              onChange={createFieldHandler('customerName')}
              placeholder="Fulano da Silva"
            />
          </LabeledField>

          <LabeledField label="Data" optional className={styles.field}>
            <input
              type="date"
              className={`form-control form-control-sm ${styles.input}`}
              value={draft.date ?? ''}
              onChange={createFieldHandler('date')}
            />
          </LabeledField>

          <LabeledField label="Horário" optional className={styles.field}>
            <input
              type="time"
              className={`form-control form-control-sm ${styles.input}`}
              value={draft.time ?? ''}
              onChange={createFieldHandler('time')}
            />
          </LabeledField>
        </div>

        <p className={styles.hint}>
          Data e horário são preenchidos com a hora deste computador. Edite os
          campos se precisar.
        </p>

        <fieldset className={styles.delivery}>
          <legend className={styles.fieldLabel}>
            Modalidade de entrega <em className={styles.optional}>(opcional)</em>
          </legend>

          <div className={styles.deliveryOptions}>
            {DELIVERY_MODES.map((mode) => (
              <label key={mode} className={styles.radioLabel}>
                <input
                  type="radio"
                  className="form-check-input"
                  name="delivery-mode"
                  value={mode}
                  checked={draft.deliveryMode === mode}
                  onChange={() => onChangeDeliveryMode(mode)}
                />
                {DELIVERY_MODE_LABELS[mode]}
              </label>
            ))}
          </div>
        </fieldset>

        <p className={styles.sectionLabel}>
          <FaBagShopping aria-hidden="true" />
          Quantidades por categoria
        </p>

        <div className={styles.categories}>
          {BAG_CATEGORIES.map((category) => (
            <QuantityCard
              key={category}
              category={category}
              quantity={draft.quantities[category]}
              onChange={(quantity) => onChangeQuantity(category, quantity)}
              onIncrement={() => onChangeQuantity(category, draft.quantities[category] + 1)}
              onDecrement={() => onChangeQuantity(category, draft.quantities[category] - 1)}
            />
          ))}
        </div>

        <p className={styles.total}>
          Total de sacolas:
          <strong className={styles.totalValue}>{totalBags}</strong>
        </p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={onGenerate}
            disabled={totalBags === 0}
            title={
              totalBags === 0
                ? 'Informe ao menos uma sacola para gerar as etiquetas'
                : 'Gerar as etiquetas, salvar no histórico e abrir a impressão'
            }
          >
            <FiPrinter aria-hidden="true" />
            Gerar Etiquetas
          </button>

          <button type="button" className={styles.secondaryButton} onClick={onClear}>
            <FaBroom aria-hidden="true" />
            Limpar
          </button>
        </div>
      </div>
    </section>
  )
}
