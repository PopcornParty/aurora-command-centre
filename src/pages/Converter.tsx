import { useState } from 'react'

const units: Record<string, Record<string, number>> = {
  Length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, in: 0.0254, ft: 0.3048, mi: 1609.34 },
  Weight: { kg: 1, g: 0.001, lb: 0.453592, oz: 0.0283495 },
  Temperature: { C: 1, F: 1, K: 1 },
  Speed: { 'm/s': 1, 'km/h': 0.277778, mph: 0.44704 },
  Data: { B: 1, KB: 1024, MB: 1048576, GB: 1073741824 }
}

export default function Converter() {
  const [cat, setCat] = useState('Length')
  const [from, setFrom] = useState('m')
  const [to, setTo] = useState('ft')
  const [val, setVal] = useState('1')

  const convert = () => {
    const n = parseFloat(val)
    if (isNaN(n)) return '—'
    if (cat === 'Temperature') {
      let c = n
      if (from === 'F') c = (n - 32) * 5/9
      if (from === 'K') c = n - 273.15
      if (to === 'F') return (c * 9/5 + 32).toFixed(2)
      if (to === 'K') return (c + 273.15).toFixed(2)
      return c.toFixed(2)
    }
    const base = n * units[cat][from]
    return (base / units[cat][to]).toFixed(4)
  }

  const opts = Object.keys(units[cat])

  return (
    <div>
      <h1 className="page-title">Unit Converter</h1>
      <div className="panel" style={{ marginTop: 16, maxWidth: 420 }}>
        <select value={cat} onChange={e => { setCat(e.target.value); const k = Object.keys(units[e.target.value]); setFrom(k[0]); setTo(k[1] || k[0]) }} style={{ width: '100%', marginBottom: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'var(--text)' }}>
          {Object.keys(units).map(c => <option key={c}>{c}</option>)}
        </select>
        <input type="number" value={val} onChange={e => setVal(e.target.value)} style={{ width: '100%', marginBottom: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'var(--text)' }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={from} onChange={e => setFrom(e.target.value)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'var(--text)' }}>
            {opts.map(o => <option key={o}>{o}</option>)}
          </select>
          <span style={{ alignSelf: 'center' }}>→</span>
          <select value={to} onChange={e => setTo(e.target.value)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'var(--text)' }}>
            {opts.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div style={{ marginTop: 16, fontSize: 22, fontFamily: 'var(--font-display)' }}>{convert()} {to}</div>
      </div>
    </div>
  )
}
