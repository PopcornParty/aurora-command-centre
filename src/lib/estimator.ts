export type TimeItem = {
  id: string
  name: string
  hours: number
  rate: number
  notes: string
}

export type CostItem = {
  id: string
  name: string
  qty: number
  unitCost: number
  recurring: 'none' | 'weekly' | 'monthly' | 'yearly'
  notes: string
}

export type Estimate = {
  id: string
  name: string
  description: string
  currency: string
  timeItems: TimeItem[]
  costItems: CostItem[]
  taxPct: number
  discountPct: number
  contingencyPct: number
  horizonMonths: number
  updated: number
}

export function createEstimate(name: string): Estimate {
  return { id: crypto.randomUUID(), name: name.trim() || 'Untitled', description: '', currency: 'GBP', timeItems: [], costItems: [], taxPct: 0, discountPct: 0, contingencyPct: 0, horizonMonths: 12, updated: Date.now() }
}

export function totalHours(items: TimeItem[]): number {
  return items.reduce((s, i) => s + (isFinite(i.hours) && i.hours > 0 ? i.hours : 0), 0)
}

export function labourCost(items: TimeItem[]): number {
  return items.reduce((s, i) => {
    const h = isFinite(i.hours) && i.hours > 0 ? i.hours : 0
    const r = isFinite(i.rate) && i.rate > 0 ? i.rate : 0
    return s + h * r
  }, 0)
}

export function itemCost(item: CostItem, horizonMonths: number): number {
  const base = (isFinite(item.qty) && item.qty > 0 ? item.qty : 0) * (isFinite(item.unitCost) && item.unitCost > 0 ? item.unitCost : 0)
  if (item.recurring === 'none') return base
  if (item.recurring === 'weekly') return base * (horizonMonths * 52 / 12)
  if (item.recurring === 'monthly') return base * horizonMonths
  if (item.recurring === 'yearly') return base * (horizonMonths / 12)
  return base
}

export function costSubtotal(items: CostItem[], horizonMonths: number): number {
  return items.reduce((s, i) => s + itemCost(i, horizonMonths), 0)
}

export function calculate(est: Estimate): { hours: number; labour: number; fixed: number; subtotal: number; afterDiscount: number; tax: number; contingency: number; total: number } {
  const hours = totalHours(est.timeItems)
  const labour = labourCost(est.timeItems)
  const fixed = costSubtotal(est.costItems, est.horizonMonths)
  const subtotal = labour + fixed
  const disc = Math.max(0, Math.min(100, est.discountPct || 0))
  const afterDiscount = subtotal * (1 - disc / 100)
  const taxPct = Math.max(0, est.taxPct || 0)
  const tax = afterDiscount * (taxPct / 100)
  const afterTax = afterDiscount + tax
  const contPct = Math.max(0, est.contingencyPct || 0)
  const contingency = afterTax * (contPct / 100)
  const total = afterTax + contingency
  return { hours, labour, fixed, subtotal, afterDiscount, tax, contingency, total }
}

export function formatHours(h: number): string {
  if (!isFinite(h) || h < 0) return '0h'
  const hrs = Math.floor(h)
  const mins = Math.round((h - hrs) * 60)
  return mins ? `${hrs}h ${mins}m` : `${hrs}h`
}

export function validateEstimate(data: unknown): Estimate | null {
  if (!data || typeof data !== 'object') return null
  const d = data as Estimate
  if (typeof d.id !== 'string' || typeof d.name !== 'string') return null
  return {
    ...d,
    timeItems: Array.isArray(d.timeItems) ? d.timeItems.filter(i => i && typeof i.id === 'string') : [],
    costItems: Array.isArray(d.costItems) ? d.costItems.filter(i => i && typeof i.id === 'string') : [],
    currency: d.currency || 'GBP',
    taxPct: isFinite(d.taxPct) ? d.taxPct : 0,
    discountPct: isFinite(d.discountPct) ? d.discountPct : 0,
    contingencyPct: isFinite(d.contingencyPct) ? d.contingencyPct : 0,
    horizonMonths: isFinite(d.horizonMonths) && d.horizonMonths > 0 ? d.horizonMonths : 12,
    updated: d.updated || Date.now()
  }
}
