export function textStats(text: string) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const chars = text.length
  const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length
  const readingMin = Math.max(1, Math.ceil(words / 200))
  return { words, chars, sentences, paragraphs, readingMin }
}

export function toCase(text: string, mode: 'upper' | 'lower' | 'title' | 'sentence'): string {
  if (mode === 'upper') return text.toUpperCase()
  if (mode === 'lower') return text.toLowerCase()
  if (mode === 'title') return text.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
  return text.replace(/(^\s*|[.!?]\s+)([a-z])/g, (_, p, c) => p + c.toUpperCase())
}

export function removeDuplicateLines(text: string): string {
  const seen = new Set<string>()
  return text.split('\n').filter(l => { const k = l.trim(); if (seen.has(k)) return false; seen.add(k); return true }).join('\n')
}

export function trimLines(text: string): string {
  return text.split('\n').map(l => l.trim()).join('\n').trim()
}

export function sortLines(text: string): string {
  return text.split('\n').sort((a, b) => a.localeCompare(b)).join('\n')
}

export function findReplace(text: string, find: string, replace: string): string {
  if (!find) return text
  return text.split(find).join(replace)
}

export function validateJson(text: string): { ok: boolean; error?: string; line?: number } {
  try {
    JSON.parse(text)
    return { ok: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid JSON'
    const m = msg.match(/position (\d+)/)
    let line: number | undefined
    if (m) {
      const pos = +m[1]
      line = text.slice(0, pos).split('\n').length
    }
    return { ok: false, error: msg, line }
  }
}

export function formatJson(text: string, pretty: boolean): { ok: boolean; result?: string; error?: string } {
  const v = validateJson(text)
  if (!v.ok) return { ok: false, error: v.error }
  const obj = JSON.parse(text)
  return { ok: true, result: pretty ? JSON.stringify(obj, null, 2) : JSON.stringify(obj) }
}

export function jsonDiff(a: string, b: string): { ok: boolean; diffs: string[]; error?: string } {
  const va = validateJson(a)
  const vb = validateJson(b)
  if (!va.ok) return { ok: false, diffs: [], error: 'A: ' + va.error }
  if (!vb.ok) return { ok: false, diffs: [], error: 'B: ' + vb.error }
  const oa = JSON.parse(a)
  const ob = JSON.parse(b)
  const diffs: string[] = []
  const walk = (pa: unknown, pb: unknown, path: string) => {
    if (JSON.stringify(pa) === JSON.stringify(pb)) return
    if (typeof pa !== 'object' || typeof pb !== 'object' || pa === null || pb === null) {
      diffs.push(`${path}: ${JSON.stringify(pa)} → ${JSON.stringify(pb)}`)
      return
    }
    const keys = new Set([...Object.keys(pa as object), ...Object.keys(pb as object)])
    for (const k of keys) {
      walk((pa as Record<string, unknown>)[k], (pb as Record<string, unknown>)[k], path ? `${path}.${k}` : k)
    }
  }
  walk(oa, ob, '')
  return { ok: true, diffs }
}

export function jsonToCsv(text: string): { ok: boolean; csv?: string; error?: string } {
  const v = validateJson(text)
  if (!v.ok) return { ok: false, error: v.error }
  const data = JSON.parse(text)
  if (!Array.isArray(data)) return { ok: false, error: 'JSON must be an array of objects' }
  if (!data.length) return { ok: true, csv: '' }
  const headers = Object.keys(data[0])
  const escape = (val: unknown) => {
    const s = val == null ? '' : String(val)
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  const rows = [headers.join(','), ...data.map((row: Record<string, unknown>) => headers.map(h => escape(row[h])).join(','))]
  return { ok: true, csv: rows.join('\n') }
}

export function csvToJson(text: string): { ok: boolean; json?: string; error?: string } {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return { ok: false, error: 'Need header and at least one row' }
  const parse = (line: string): string[] => {
    const out: string[] = []
    let cur = ''
    let inQ = false
    for (let i = 0; i < line.length; i++) {
      const c = line[i]
      if (inQ) {
        if (c === '"' && line[i + 1] === '"') { cur += '"'; i++ }
        else if (c === '"') inQ = false
        else cur += c
      } else {
        if (c === '"') inQ = true
        else if (c === ',') { out.push(cur); cur = '' }
        else cur += c
      }
    }
    out.push(cur)
    return out
  }
  const headers = parse(lines[0])
  const rows = lines.slice(1).map(l => {
    const vals = parse(l)
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => { obj[h] = vals[i] ?? '' })
    return obj
  })
  return { ok: true, json: JSON.stringify(rows, null, 2) }
}

export function urlEncode(s: string): string { return encodeURIComponent(s) }
export function urlDecode(s: string): { ok: boolean; result?: string; error?: string } {
  try { return { ok: true, result: decodeURIComponent(s) } }
  catch { return { ok: false, error: 'Invalid percent-encoding' } }
}

export function b64Encode(s: string): string {
  return btoa(unescape(encodeURIComponent(s)))
}
export function b64Decode(s: string): { ok: boolean; result?: string; error?: string } {
  try { return { ok: true, result: decodeURIComponent(escape(atob(s))) } }
  catch { return { ok: false, error: 'Invalid Base64' } }
}

export function uuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  const b = new Uint8Array(16)
  crypto.getRandomValues(b)
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  const h = Array.from(b).map(x => x.toString(16).padStart(2, '0')).join('')
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`
}

export function timestampToDate(ts: number): { utc: string; local: string } {
  const d = new Date(ts * 1000)
  return { utc: d.toISOString(), local: d.toString() }
}

export function dateToTimestamp(iso: string): { ok: boolean; ts?: number; error?: string } {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return { ok: false, error: 'Invalid date' }
  return { ok: true, ts: Math.floor(d.getTime() / 1000) }
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.replace('#', '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  if (!m) return null
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0, s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

export function regexTest(pattern: string, flags: string, text: string): { ok: boolean; matches: string[]; error?: string } {
  try {
    const matches = Array.from(text.matchAll(new RegExp(pattern, flags.includes('g') ? flags : flags + 'g'))).map(m => m[0])
    return { ok: true, matches }
  } catch (e) {
    return { ok: false, matches: [], error: e instanceof Error ? e.message : 'Invalid pattern' }
  }
}

export async function hashText(text: string, algo: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'): Promise<string> {
  const data = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest(algo, data)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export function percentage(value: number, percent: number): number {
  return value * percent / 100
}

export function discount(price: number, percent: number): { saved: number; final: number } {
  const saved = percentage(price, percent)
  return { saved, final: price - saved }
}

export function simplifyRatio(a: number, b: number): { a: number; b: number } {
  const g = (x: number, y: number): number => y === 0 ? x : g(y, x % y)
  const d = g(Math.abs(a), Math.abs(b)) || 1
  return { a: a / d, b: b / d }
}

const UNITS: Record<string, Record<string, number>> = {
  length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, ft: 0.3048, in: 0.0254, mi: 1609.344 },
  mass: { kg: 1, g: 0.001, lb: 0.453592, oz: 0.0283495 },
  speed: { 'm/s': 1, 'km/h': 0.277778, mph: 0.44704 },
  storage: { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 }
}

export function convertUnit(cat: string, from: string, to: string, value: number): number | null {
  if (cat === 'temperature') {
    let c = value
    if (from === 'F') c = (value - 32) * 5 / 9
    if (from === 'K') c = value - 273.15
    if (to === 'C') return c
    if (to === 'F') return c * 9 / 5 + 32
    if (to === 'K') return c + 273.15
    return null
  }
  const table = UNITS[cat]
  if (!table || !(from in table) || !(to in table)) return null
  return value * table[from] / table[to]
}

export function dateDiff(a: string, b: string): { ok: boolean; days?: number; error?: string } {
  const da = new Date(a)
  const db = new Date(b)
  if (isNaN(da.getTime()) || isNaN(db.getTime())) return { ok: false, error: 'Invalid date' }
  const days = Math.round((db.getTime() - da.getTime()) / 86400000)
  return { ok: true, days }
}

export function addDays(iso: string, days: number): { ok: boolean; result?: string; error?: string } {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return { ok: false, error: 'Invalid date' }
  d.setDate(d.getDate() + days)
  return { ok: true, result: d.toISOString().slice(0, 10) }
}

export function generatePassword(len: number, opts: { upper?: boolean; lower?: boolean; digits?: boolean; symbols?: boolean }): string {
  let chars = ''
  if (opts.upper !== false) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (opts.lower !== false) chars += 'abcdefghijklmnopqrstuvwxyz'
  if (opts.digits !== false) chars += '0123456789'
  if (opts.symbols) chars += '!@#$%^&*()-_=+'
  if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz'
  const arr = new Uint32Array(len)
  crypto.getRandomValues(arr)
  return Array.from(arr).map(n => chars[n % chars.length]).join('')
}
