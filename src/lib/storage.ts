export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

export function resetKey(key: string) {
  localStorage.removeItem(key)
}

export function exportAll() {
  const keys = ['aurora-notes', 'aurora-tasks', 'aurora-projects', 'aurora-bookmarks', 'aurora-scratchpad', 'aurora-settings']
  const data: Record<string, unknown> = {}
  keys.forEach(k => {
    const raw = localStorage.getItem(k)
    if (raw) data[k] = JSON.parse(raw)
  })
  return data
}
