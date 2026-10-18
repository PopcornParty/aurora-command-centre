export type Status = 'active' | 'paused' | 'done' | 'archived'
export type Priority = 'low' | 'medium' | 'high'

export type Task = {
  id: string
  text: string
  done: boolean
  priority: Priority
  due: string | null
  notes: string
}

export type Milestone = {
  id: string
  name: string
  date: string | null
  done: boolean
}

export type Project = {
  id: string
  name: string
  description: string
  status: Status
  priority: Priority
  start: string | null
  due: string | null
  tasks: Task[]
  milestones: Milestone[]
  created: number
}

export type TrackerData = { projects: Project[] }

export function progress(p: Project): number {
  if (!p.tasks.length) return 0
  return Math.round(p.tasks.filter(t => t.done).length / p.tasks.length * 100)
}

export function isOverdue(date: string | null): boolean {
  if (!date) return false
  const d = new Date(date)
  if (isNaN(d.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return d < today
}

export function createProject(name: string): Project {
  return {
    id: crypto.randomUUID(),
    name: name.trim() || 'Untitled',
    description: '',
    status: 'active',
    priority: 'medium',
    start: null,
    due: null,
    tasks: [],
    milestones: [],
    created: Date.now()
  }
}

export function addTask(p: Project, text: string): Project {
  const task: Task = { id: crypto.randomUUID(), text: text.trim() || 'Task', done: false, priority: 'medium', due: null, notes: '' }
  return { ...p, tasks: [...p.tasks, task] }
}

export function toggleTask(p: Project, taskId: string): Project {
  return { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t) }
}

export function deleteTask(p: Project, taskId: string): Project {
  return { ...p, tasks: p.tasks.filter(t => t.id !== taskId) }
}

export function addMilestone(p: Project, name: string, date: string | null): Project {
  const m: Milestone = { id: crypto.randomUUID(), name: name.trim() || 'Milestone', date, done: false }
  return { ...p, milestones: [...p.milestones, m] }
}

export function filterProjects(list: Project[], q: string, status?: Status): Project[] {
  let out = list
  if (status) out = out.filter(p => p.status === status)
  if (q.trim()) {
    const s = q.toLowerCase()
    out = out.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s) || p.tasks.some(t => t.text.toLowerCase().includes(s)))
  }
  return out
}

export function sortProjects(list: Project[], by: 'name' | 'due' | 'priority' | 'progress'): Project[] {
  const pri = { high: 0, medium: 1, low: 2 }
  return [...list].sort((a, b) => {
    if (by === 'name') return a.name.localeCompare(b.name)
    if (by === 'due') return (a.due || '9999').localeCompare(b.due || '9999')
    if (by === 'priority') return pri[a.priority] - pri[b.priority]
    return progress(b) - progress(a)
  })
}

export function overdueTasks(list: Project[]): { project: Project; task: Task }[] {
  const out: { project: Project; task: Task }[] = []
  for (const p of list) {
    if (p.status === 'archived') continue
    for (const t of p.tasks) {
      if (!t.done && isOverdue(t.due)) out.push({ project: p, task: t })
    }
  }
  return out
}

export function upcomingMilestones(list: Project[], days = 14): { project: Project; milestone: Milestone }[] {
  const out: { project: Project; milestone: Milestone }[] = []
  const now = Date.now()
  const limit = now + days * 86400000
  for (const p of list) {
    if (p.status === 'archived') continue
    for (const m of p.milestones) {
      if (m.done || !m.date) continue
      const d = new Date(m.date).getTime()
      if (d >= now && d <= limit) out.push({ project: p, milestone: m })
    }
  }
  return out.sort((a, b) => (a.milestone.date || '').localeCompare(b.milestone.date || ''))
}

export function validateTracker(data: unknown): TrackerData {
  if (!data || typeof data !== 'object' || !Array.isArray((data as TrackerData).projects)) return { projects: [] }
  const projects = ((data as TrackerData).projects).filter(p => p && typeof p.id === 'string' && typeof p.name === 'string').map(p => ({
    ...p,
    tasks: Array.isArray(p.tasks) ? p.tasks.filter(t => t && typeof t.id === 'string') : [],
    milestones: Array.isArray(p.milestones) ? p.milestones.filter(m => m && typeof m.id === 'string') : []
  }))
  return { projects }
}
