export type StepType = 'info' | 'yesno' | 'choice' | 'check' | 'cause' | 'solution' | 'end'

export type Step = {
  id: string
  type: StepType
  title: string
  body: string
  choices?: { label: string; next: string }[]
  yesNext?: string
  noNext?: string
  next?: string
}

export type Guide = {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  favourite: boolean
  steps: Step[]
  startId: string
  updated: number
}

export function createGuide(name: string): Guide {
  const start: Step = { id: crypto.randomUUID(), type: 'info', title: 'Start', body: '', next: '' }
  return { id: crypto.randomUUID(), name: name.trim() || 'Untitled', description: '', category: '', tags: [], favourite: false, steps: [start], startId: start.id, updated: Date.now() }
}

export function findStep(g: Guide, id: string): Step | undefined {
  return g.steps.find(s => s.id === id)
}

export function nextStep(_g: Guide, current: Step, answer?: string): string | null {
  if (current.type === 'yesno') {
    if (answer === 'yes') return current.yesNext || null
    if (answer === 'no') return current.noNext || null
    return null
  }
  if (current.type === 'choice' && current.choices) {
    const c = current.choices.find(x => x.label === answer)
    return c?.next || null
  }
  return current.next || null
}

export function validateGuide(g: Guide): { ok: boolean; errors: string[] } {
  const errors: string[] = []
  const ids = new Set(g.steps.map(s => s.id))
  if (!ids.has(g.startId)) errors.push('Start step missing')
  for (const s of g.steps) {
    if (!s.title.trim()) errors.push(`Step ${s.id.slice(0, 6)} missing title`)
    const check = (id: string | undefined, label: string) => {
      if (id && !ids.has(id)) errors.push(`${s.title}: ${label} points to missing step`)
    }
    check(s.next, 'next')
    check(s.yesNext, 'yes')
    check(s.noNext, 'no')
    s.choices?.forEach(c => check(c.next, c.label))
  }
  return { ok: errors.length === 0, errors }
}

export function unreachable(g: Guide): string[] {
  const reachable = new Set<string>()
  const visit = (id: string) => {
    if (!id || reachable.has(id)) return
    const s = findStep(g, id)
    if (!s) return
    reachable.add(id)
    if (s.next) visit(s.next)
    if (s.yesNext) visit(s.yesNext)
    if (s.noNext) visit(s.noNext)
    s.choices?.forEach(c => visit(c.next))
  }
  visit(g.startId)
  return g.steps.filter(s => !reachable.has(s.id)).map(s => s.id)
}

export function validateImported(data: unknown): Guide | null {
  if (!data || typeof data !== 'object') return null
  const d = data as Guide
  if (typeof d.id !== 'string' || typeof d.name !== 'string' || !Array.isArray(d.steps)) return null
  return { ...d, steps: d.steps.filter(s => s && typeof s.id === 'string'), tags: d.tags || [], favourite: !!d.favourite, updated: d.updated || Date.now() }
}
