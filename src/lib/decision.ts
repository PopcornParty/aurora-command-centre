export type Criterion = {
  id: string
  name: string
  weight: number
  higherIsBetter: boolean
}

export type Option = {
  id: string
  name: string
  description: string
  scores: Record<string, number | null>
}

export type Scenario = {
  id: string
  name: string
  description: string
  criteria: Criterion[]
  options: Option[]
  updated: number
}

export function createScenario(name: string): Scenario {
  return { id: crypto.randomUUID(), name: name.trim() || 'Untitled', description: '', criteria: [], options: [], updated: Date.now() }
}

export function weightedScore(opt: Option, criteria: Criterion[]): { total: number | null; missing: number; breakdown: { id: string; contribution: number | null }[] } {
  const active = criteria.filter(c => c.weight > 0)
  if (!active.length) return { total: null, missing: 0, breakdown: [] }
  let sum = 0
  let weightSum = 0
  let missing = 0
  const breakdown = active.map(c => {
    const raw = opt.scores[c.id]
    if (raw == null || isNaN(raw)) { missing++; return { id: c.id, contribution: null } }
    const score = c.higherIsBetter ? raw : (10 - raw + 1)
    const contrib = score * c.weight
    sum += contrib
    weightSum += c.weight
    return { id: c.id, contribution: contrib }
  })
  if (weightSum === 0) return { total: null, missing, breakdown }
  return { total: sum / weightSum, missing, breakdown }
}

export function rank(options: Option[], criteria: Criterion[]): { option: Option; score: number | null; rank: number; missing: number }[] {
  const scored = options.map(o => {
    const r = weightedScore(o, criteria)
    return { option: o, score: r.total, missing: r.missing }
  })
  const sorted = [...scored].sort((a, b) => {
    if (a.score == null && b.score == null) return 0
    if (a.score == null) return 1
    if (b.score == null) return -1
    return b.score - a.score
  })
  let currentRank = 1
  return sorted.map((s, i) => {
    if (i > 0 && s.score !== sorted[i - 1].score) currentRank = i + 1
    return { ...s, rank: s.score == null ? 0 : currentRank }
  })
}

export function validateScenario(data: unknown): Scenario | null {
  if (!data || typeof data !== 'object') return null
  const d = data as Scenario
  if (typeof d.id !== 'string' || typeof d.name !== 'string') return null
  return {
    ...d,
    criteria: Array.isArray(d.criteria) ? d.criteria.filter(c => c && typeof c.id === 'string') : [],
    options: Array.isArray(d.options) ? d.options.filter(o => o && typeof o.id === 'string').map(o => ({ ...o, scores: o.scores || {} })) : [],
    updated: d.updated || Date.now()
  }
}
