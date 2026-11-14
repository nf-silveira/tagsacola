/**
 * Contratos e regras do domínio de etiquetas.
 *
 * Puro, sem dependência de React ou do navegador: pode ser usado pela UI,
 * pela impressão e pela persistência, e testado isoladamente.
 */

export const BAG_CATEGORIES = ['dry', 'refrigerated', 'frozen', 'pack'] as const

export type BagCategory = (typeof BAG_CATEGORIES)[number]

export const BAG_CATEGORY_LABELS: Record<BagCategory, string> = {
  dry: 'Secas',
  refrigerated: 'Resfriadas',
  frozen: 'Congeladas',
  pack: 'Pack (fardo)',
}

/** Rótulo no singular, como aparece impresso na etiqueta ("7 secas", "1 resfriada"). */
export const BAG_CATEGORY_SINGULAR_LABELS: Record<
  BagCategory,
  { singular: string; plural: string }
> = {
  dry: { singular: 'seca', plural: 'secas' },
  refrigerated: { singular: 'resfriada', plural: 'resfriadas' },
  frozen: { singular: 'congelada', plural: 'congeladas' },
  pack: { singular: 'pack', plural: 'packs' },
}

export type BagQuantities = Record<BagCategory, number>

export function createEmptyBagQuantities(): BagQuantities {
  return { dry: 0, refrigerated: 0, frozen: 0, pack: 0 }
}

export function countBags(quantities: BagQuantities): number {
  return BAG_CATEGORIES.reduce((total, category) => total + quantities[category], 0)
}

export type DeliveryMode = 'scheduled' | 'immediate'

export const DELIVERY_MODE_LABELS: Record<DeliveryMode, string> = {
  scheduled: 'Agendada',
  immediate: 'Imediata',
}

/**
 * Identificação opcional da compra. `null` representa informação não informada:
 * a etiqueta simplesmente omite o campo, sem exibir "Não informado".
 */
export interface LabelIdentification {
  purchaseNumber: string | null
  customerName: string | null
  /** Data no formato ISO `yyyy-mm-dd`. */
  date: string | null
  /** Horário no formato `HH:mm`. */
  time: string | null
  deliveryMode: DeliveryMode | null
}

/** Dados em edição no formulário. */
export interface LabelDraft extends LabelIdentification {
  quantities: BagQuantities
}

/** Etiqueta gerada e persistida no histórico. */
export interface LabelBatch extends LabelIdentification {
  id: string
  /** Data de criação em formato ISO 8601. */
  createdAt: string
  quantities: BagQuantities
}
