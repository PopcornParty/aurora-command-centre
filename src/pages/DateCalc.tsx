import { useState } from 'react'

export default function DateCalc() {
  const [d1, setD1] = useState('')
  const [d2, setD2] = useState('')
  const [days, setDays] = useState(0)

  let diff = ''
  if (d1 && d2) {
    const a = new Date(d1).getTime()
    const b = new Date(d2).getTime()
    if (!isNaN(a) && !isNaN(b)) diff = Math.abs(Math.round((b - a) / 86400000)) + ' days'
  }

  let added = ''
  if (d1 && days) {
    const d = new Date(d1)
    if (!isNaN(d.getTime())) {
      d.setDate(d.getDate() + days)
      added = d.toISOString().slice(0, 10)
    }
  }

  return (
    <div>
      <h1 className="page-title">Date Calculator</h1>
      <div className="panel" style={{ marginTop: 16, maxWidth: 420 }}>
        <label>From <input type="date" value={d1} onChange={e => setD1(e.target.value)} style={{ marginLeft: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 6, padding: 6, color: 'var(--text)' }} /></label>
        <br /><br />
        <label>To <input type="date" value={d2} onChange={e => setD2(e.target.value)} style={{ marginLeft: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 6, padding: 6, color: 'var(--text)' }} /></label>
        <p style={{ marginTop: 12 }}>{diff || 'Select two dates'}</p>
        <hr style={{ margin: '16px 0', borderColor: 'var(--border)' }} />
        <label>Add days <input type="number" value={days} onChange={e => setDays(+e.target.value)} style={{ width: 80, marginLeft: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 6, padding: 6, color: 'var(--text)' }} /></label>
        <p style={{ marginTop: 12 }}>{added || '—'}</p>
      </div>
    </div>
  )
}
