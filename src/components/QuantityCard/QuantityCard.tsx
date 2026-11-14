import type { ChangeEvent } from 'react'
import type { IconType } from 'react-icons'
import { FiMinus, FiPlus } from 'react-icons/fi'
import { FaBagShopping, FaBoxOpen, FaSnowflake, FaTemperatureHalf } from 'react-icons/fa6'

import {
  BAG_CATEGORY_LABELS,
  BAG_CATEGORY_NAMES,
  type BagCategory,
} from '@/domain/label'

import styles from './QuantityCard.module.css'

const CATEGORY_ICONS: Record<BagCategory, IconType> = {
  dry: FaBagShopping,
  refrigerated: FaTemperatureHalf,
  frozen: FaSnowflake,
  pack: FaBoxOpen,
}

interface QuantityCardProps {
  category: BagCategory
  quantity: number
  onIncrement: () => void
  onDecrement: () => void
  onChange: (quantity: number) => void
}

export function QuantityCard({
  category,
  quantity,
  onIncrement,
  onDecrement,
  onChange,
}: QuantityCardProps) {
  const Icon = CATEGORY_ICONS[category]
  const categoryName = BAG_CATEGORY_NAMES[category].plural

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.valueAsNumber)
  }

  return (
    <div className={`${styles.card} ${styles[category]}`}>
      <span className={styles.icon} aria-hidden="true">
        <Icon size={22} />
      </span>

      <p className={styles.name}>{BAG_CATEGORY_LABELS[category]}</p>

      <p className={styles.quantity}>{quantity}</p>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.stepButton}
          onClick={onDecrement}
          disabled={quantity === 0}
          aria-label={`Diminuir ${categoryName}`}
        >
          <FiMinus aria-hidden="true" />
        </button>

        <input
          type="number"
          className={styles.input}
          min={0}
          step={1}
          inputMode="numeric"
          value={quantity}
          onChange={handleChange}
          aria-label={`Quantidade de ${categoryName}`}
        />

        <button
          type="button"
          className={styles.stepButton}
          onClick={onIncrement}
          aria-label={`Aumentar ${categoryName}`}
        >
          <FiPlus aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
