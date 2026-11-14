import type { ChangeEvent } from 'react'
import { FaBagShopping, FaBroom, FaCartShopping } from 'react-icons/fa6'
import { FiCopy, FiPrinter } from 'react-icons/fi'

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
  onDuplicateLast: () => void
  canDuplicateLast: boolean
}

export function OrderForm({
  draft,
  totalBags,
  onChangeField,
  onChangeDeliveryMode,
  onChangeQuantity,
  onGenerate,
  onClear,
  onDuplicateLast,
  canDuplicateLast,
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
          <label className={styles.field}>
            <span className={styles.fieldLabel}>
              Número da compra <em className={styles.optional}>(opcional)</em>
            </span>
            <input
              type="text"
              className={`form-control form-control-sm ${styles.input}`}
              inputMode="numeric"
              value={draft.purchaseNumber ?? ''}
              onChange={createFieldHandler('purchaseNumber')}
              placeholder="2026"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>
              Nome do cliente <em className={styles.optional}>(opcional)</em>
            </span>
            <input
              type="text"
              className={`form-control form-control-sm ${styles.input}`}
              value={draft.customerName ?? ''}
              onChange={createFieldHandler('customerName')}
              placeholder="Fulano da Silva"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>
              Data <em className={styles.optional}>(opcional)</em>
            </span>
            <input
              type="date"
              className={`form-control form-control-sm ${styles.input}`}
              value={draft.date ?? ''}
              onChange={createFieldHandler('date')}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>
              Horário <em className={styles.optional}>(opcional)</em>
            </span>
            <input
              type="time"
              className={`form-control form-control-sm ${styles.input}`}
              value={draft.time ?? ''}
              onChange={createFieldHandler('time')}
            />
          </label>
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
                : 'Gerar as etiquetas e salvar no histórico'
            }
          >
            <FiPrinter aria-hidden="true" />
            Gerar Etiquetas
          </button>

          <button type="button" className={styles.secondaryButton} onClick={onClear}>
            <FaBroom aria-hidden="true" />
            Limpar
          </button>

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onDuplicateLast}
            disabled={!canDuplicateLast}
            title="Carregar os dados da última compra gerada"
          >
            <FiCopy aria-hidden="true" />
            Duplicar
          </button>
        </div>
      </div>
    </section>
  )
}
