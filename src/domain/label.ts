/**
 * Contratos e regras do domínio de etiquetas.
 *
 * Puro, sem dependência de React ou do navegador: pode ser usado pela UI,
 * pela impressão e pela persistência, e testado isoladamente.
 */

import { z } from 'zod'

export const BAG_CATEGORIES = ['dry', 'refrigerated', 'frozen', 'pack'] as const

export type BagCategory = (typeof BAG_CATEGORIES)[number]

export const BAG_CATEGORY_LABELS: Record<BagCategory, string> = {
  dry: 'Secas',
  refrigerated: 'Resfriadas',
  frozen: 'Congeladas',
  pack: 'Pack (fardo)',
}

/** Rótulos no singular e no plural, como aparecem impressos ("7 secas", "1 resfriada"). */
export const BAG_CATEGORY_NAMES: Record<
  BagCategory,
  { singular: string; plural: string }
> = {
  dry: { singular: 'seca', plural: 'secas' },
  refrigerated: { singular: 'resfriada', plural: 'resfriadas' },
  frozen: { singular: 'congelada', plural: 'congeladas' },
  pack: { singular: 'pack', plural: 'packs' },
}

export const bagQuantitiesSchema = z.object({
  dry: z.number().int().min(0),
  refrigerated: z.number().int().min(0),
  frozen: z.number().int().min(0),
  pack: z.number().int().min(0),
})

export type BagQuantities = z.infer<typeof bagQuantitiesSchema>

export const DELIVERY_MODES = ['scheduled', 'immediate'] as const

export type DeliveryMode = (typeof DELIVERY_MODES)[number]

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

export const labelBatchSchema = z.object({
  id: z.string().min(1),
  createdAt: z.string().min(1),
  purchaseNumber: z.string().nullable(),
  customerName: z.string().nullable(),
  date: z.string().nullable(),
  time: z.string().nullable(),
  deliveryMode: z.enum(DELIVERY_MODES).nullable(),
  quantities: bagQuantitiesSchema,
})

/** Quantidade máxima de registros mantidos no histórico local. */
export const MAX_HISTORY_ITEMS = 20

export function createEmptyBagQuantities(): BagQuantities {
  return { dry: 0, refrigerated: 0, frozen: 0, pack: 0 }
}

export function createEmptyDraft(): LabelDraft {
  return {
    purchaseNumber: null,
    customerName: null,
    date: null,
    time: null,
    deliveryMode: null,
    quantities: createEmptyBagQuantities(),
  }
}

export function countBags(quantities: BagQuantities): number {
  return BAG_CATEGORIES.reduce((total, category) => total + quantities[category], 0)
}

export function formatQuantityLabel(category: BagCategory, quantity: number): string {
  const names = BAG_CATEGORY_NAMES[category]
  return `${quantity} ${quantity === 1 ? names.singular : names.plural}`
}

/** "14/11 - 07:45" | "14/11" | "07:45" | null, conforme o que foi informado. */
export function formatLabelDateTime(date: string | null, time: string | null): string | null {
  const datePart = date ? date.slice(8, 10) + '/' + date.slice(5, 7) : null
  const parts = [datePart, time].filter((part): part is string => Boolean(part))

  return parts.length > 0 ? parts.join(' - ') : null
}

export function createLabelBatch(draft: LabelDraft): LabelBatch {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...draft,
    quantities: { ...draft.quantities },
  }
}
