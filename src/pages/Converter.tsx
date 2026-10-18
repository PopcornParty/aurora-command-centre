import { useState } from 'react'

const UNITS: Record<string, Record<string, number>> = {
  Length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, ft: 0.3048, in: 0.0254, mi: 1609.344 },
  Mass: { kg: 1, g: 0.001, lb: 0.453592, oz: 0.0283495 },
  Temperature: { C: 1, F: 1, K: 1 },
  Speed: { 'm/s': 1, 'km/h': 0.277778, mph: 0.44704 }
}

export default function Converter() {
  const [cat, setCat] = useState('Length')
  const [from, setFrom] = useState('m')
  const [to, setTo] = useState('km')
  const [val, setVal] = useState('1')

  const units = Object.keys(UNITS[cat] || {})

  let result = ''
  try {
    const n = parseFloat(val)
    if (!isNaN(n) && UNITS[cat]) {
      if (cat === 'Temperature') {
        let c = n
        if (from === 'F') c = (n - 32) * 5/9
        if (from === 'K') c = n - 273.15
        let out = c
        if (to === 'F') out = c * 9/5 + 32
        if (to === 'K') out = c + 273.15
        result = out.toFixed(2)
      } else {
        const base = n * UNITS[cat][from]
        result = (base / UNITS[cat][to]).toFixed(4)
      }
    }
  } catch {}

  return (
    <div>
      <h1 className="page-title">Unit Converter</h1>
      <div className="panel" style={{ marginTop: 16, maxWidth: 420 }}>
        <select value={cat} onChange={e => { setCat(e.target.value); const u = Object.keys(UNITS[e.target.value]); setFrom(u[0]); setTo(u[1] || u[0]) }} style={{ width: '100%', marginBottom: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: 8 }}>
          {Object.keys(UNITS).map(c => <option key={c}>{c}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input value={val} onChange={e => setVal(e.target.value)} type="number" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'var(--text)' }} />
          <select value={from} onChange={e => setFrom(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: 8 }}>
            {units.map(u => <option key={u}>{u}</option>)}
          </select>
          <span>→</span>
          <select value={to} onChange={e => setTo(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: 8 }}>
            {units.map(u => <option key={u}>{u}</option>)}
          </select>
        </div>
        <div style={{ marginTop: 16, fontSize: 20, fontFamily: 'var(--font-display)' }}>{result || '—'}</div>
      </div>
    </div>
  )
}
