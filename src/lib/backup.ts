import { validateTracker, type TrackerData } from './tracker'

export type Backup = {
  notes?: unknown
  tasks?: unknown
  projects?: unknown
  bookmarks?: unknown
  scratchpad?: unknown
  calendar?: unknown
  kanban?: unknown
  scoreboard?: unknown
  tournaments?: unknown
  tracker?: unknown
  settings?: unknown
  exportedAt?: number
}

export function buildBackup(data: Record<string, unknown>, exportedAt: number): Backup {
  return { ...data, exportedAt }
}

export function mergeTracker(existing: TrackerData, imported: unknown): TrackerData {
  if (imported === undefined || imported === null) return existing
  return validateTracker(imported)
}

export function hasTracker(backup: Backup): boolean {
  return backup.tracker !== undefined && backup.tracker !== null
}
