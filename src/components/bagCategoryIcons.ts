import type { IconType } from 'react-icons'
import { FaBagShopping, FaBoxOpen, FaSnowflake, FaTemperatureHalf } from 'react-icons/fa6'

import type { BagCategory } from '@/domain/label'

/**
 * Ícone de cada categoria de sacola.
 *
 * Compartilhado pelo cartão de quantidade e pela etiqueta impressa para que os
 * dois continuem exibindo a mesma iconografia.
 */
export const BAG_CATEGORY_ICONS: Record<BagCategory, IconType> = {
  dry: FaBagShopping,
  refrigerated: FaTemperatureHalf,
  frozen: FaSnowflake,
  pack: FaBoxOpen,
}
