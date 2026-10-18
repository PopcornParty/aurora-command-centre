import { useState, useEffect } from 'react'
import { loadJSON, saveJSON } from '../lib/storage'
import { createEstimate, calculate, formatHours, validateEstimate, type Estimate, type CostItem } from '../lib/estimator'

const KEY = 'aurora-estimates'

export default function Estimator() {
  const [list, setList] = useState<Estimate[]>(() => loadJSON(KEY, []).map(validateEstimate).filter(Boolean) as Estimate[])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')

  useEffect(() => { saveJSON(KEY, list) }, [list])

  const active = list.find(e => e.id === activeId) || null
  const patch = (fn: (e: Estimate) => Estimate) => setList(l => l.map(e => e.id === activeId ? fn({ ...e, updated: Date.now() }) : e))

  const create = () => {
    if (!newName.trim()) return
    const e = createEstimate(newName)
    setList([e, ...list])
    setActiveId(e.id)
    setNewName('')
  }

  const del = (id: string) => {
    if (!confirm('Delete this estimate?')) return
    setList(l => l.filter(e => e.id !== id))
    if (activeId === id) setActiveId(null)
  }

  if (!active) {
    return (
      <div>
        <h1 className="page-title">Time & Cost Estimator</h1>
        <p className="subtitle">Estimate labour hours, fixed costs and totals. Default currency GBP.</p>
        <div style={{ display: 'flex', gap: 6, margin: '12px 0' }}>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="New estimate" style={inputStyle} />
          <button className="btn btn-primary" onClick={create}>Create</button>
        </div>
        {list.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No estimates yet.</p>}
        {list.map(e => (
          <div key={e.id} className="panel" style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span onClick={() => setActiveId(e.id)} role="button" tabIndex={0} style={{ flex: 1 }}>{e.name}</span>
            <button className="btn" onClick={() => del(e.id)}>Delete</button>
          </div>
        ))}
      </div>
    )
  }

  const calc = calculate(active)
  const sym = active.currency === 'GBP' ? '£' : active.currency === 'USD' ? '$' : active.currency === 'EUR' ? '€' : active.currency

  return (
    <div>
      <button className="btn" onClick={() => setActiveId(null)} style={{ marginBottom: 10 }}>← Back</button>
      <input value={active.name} onChange={e => patch(est => ({ ...est, name: e.target.value }))} style={{ ...inputStyle, fontSize: 18, fontWeight: 600 }} />
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <select value={active.currency} onChange={e => patch(est => ({ ...est, currency: e.target.value }))} style={inputStyle}>
          <option>GBP</option><option>USD</option><option>EUR</option>
        </select>
        <label style={{ fontSize: 13 }}>Horizon <input type="number" min={1} value={active.horizonMonths} onChange={e => patch(est => ({ ...est, horizonMonths: +e.target.value || 12 }))} style={{ width: 50 }} /> months</label>
      </div>

      <h3>Time</h3>
      {active.timeItems.map(t => (
        <div key={t.id} style={{ display: 'flex', gap: 4, marginBottom: 4, flexWrap: 'wrap' }}>
          <input value={t.name} onChange={e => patch(est => ({ ...est, timeItems: est.timeItems.map(x => x.id === t.id ? { ...x, name: e.target.value } : x) }))} placeholder="Task" style={{ ...inputStyle, flex: 1, margin: 0 }} />
          <input type="number" min={0} step={0.25} value={t.hours} onChange={e => patch(est => ({ ...est, timeItems: est.timeItems.map(x => x.id === t.id ? { ...x, hours: +e.target.value || 0 } : x) }))} style={{ ...inputStyle, width: 60, margin: 0 }} />
          <input type="number" min={0} value={t.rate} onChange={e => patch(est => ({ ...est, timeItems: est.timeItems.map(x => x.id === t.id ? { ...x, rate: +e.target.value || 0 } : x) }))} style={{ ...inputStyle, width: 70, margin: 0 }} />
          <button className="btn" onClick={() => patch(est => ({ ...est, timeItems: est.timeItems.filter(x => x.id !== t.id) }))}>×</button>
        </div>
      ))}
      <button className="btn" onClick={() => patch(est => ({ ...est, timeItems: [...est.timeItems, { id: crypto.randomUUID(), name: 'Task', hours: 1, rate: 0, notes: '' }] }))}>Add time</button>

      <h3 style={{ marginTop: 12 }}>Costs</h3>
      {active.costItems.map(c => (
        <div key={c.id} style={{ display: 'flex', gap: 4, marginBottom: 4, flexWrap: 'wrap' }}>
          <input value={c.name} onChange={e => patch(est => ({ ...est, costItems: est.costItems.map(x => x.id === c.id ? { ...x, name: e.target.value } : x) }))} placeholder="Item" style={{ ...inputStyle, flex: 1, margin: 0 }} />
          <input type="number" min={0} value={c.qty} onChange={e => patch(est => ({ ...est, costItems: est.costItems.map(x => x.id === c.id ? { ...x, qty: +e.target.value || 0 } : x) }))} style={{ ...inputStyle, width: 50, margin: 0 }} />
          <input type="number" min={0} value={c.unitCost} onChange={e => patch(est => ({ ...est, costItems: est.costItems.map(x => x.id === c.id ? { ...x, unitCost: +e.target.value || 0 } : x) }))} style={{ ...inputStyle, width: 70, margin: 0 }} />
          <select value={c.recurring} onChange={e => patch(est => ({ ...est, costItems: est.costItems.map(x => x.id === c.id ? { ...x, recurring: e.target.value as CostItem['recurring'] } : x) }))} style={inputStyle}>
            <option value="none">Once</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option>
          </select>
          <button className="btn" onClick={() => patch(est => ({ ...est, costItems: est.costItems.filter(x => x.id !== c.id) }))}>×</button>
        </div>
      ))}
      <button className="btn" onClick={() => patch(est => ({ ...est, costItems: [...est.costItems, { id: crypto.randomUUID(), name: 'Item', qty: 1, unitCost: 0, recurring: 'none', notes: '' }] }))}>Add cost</button>

      <h3 style={{ marginTop: 12 }}>Adjustments</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        <label style={{ fontSize: 13 }}>Discount % <input type="number" min={0} max={100} value={active.discountPct} onChange={e => patch(est => ({ ...est, discountPct: +e.target.value || 0 }))} style={{ width: 50 }} /></label>
        <label style={{ fontSize: 13 }}>Tax % <input type="number" min={0} value={active.taxPct} onChange={e => patch(est => ({ ...est, taxPct: +e.target.value || 0 }))} style={{ width: 50 }} /></label>
        <label style={{ fontSize: 13 }}>Contingency % <input type="number" min={0} value={active.contingencyPct} onChange={e => patch(est => ({ ...est, contingencyPct: +e.target.value || 0 }))} style={{ width: 50 }} /></label>
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Order: subtotal → discount → tax → contingency. Tax is optional and not legal advice.</p>

      <div className="panel" style={{ marginTop: 10 }}>
        <div>Time: <strong>{formatHours(calc.hours)}</strong></div>
        <div>Labour: {sym}{calc.labour.toFixed(2)}</div>
        <div>Costs: {sym}{calc.fixed.toFixed(2)}</div>
        <div>Subtotal: {sym}{calc.subtotal.toFixed(2)}</div>
        {active.discountPct > 0 && <div>After discount: {sym}{calc.afterDiscount.toFixed(2)}</div>}
        {active.taxPct > 0 && <div>Tax: {sym}{calc.tax.toFixed(2)}</div>}
        {active.contingencyPct > 0 && <div>Contingency: {sym}{calc.contingency.toFixed(2)}</div>}
        <div style={{ marginTop: 6, fontSize: 18 }}>Total: <strong>{sym}{calc.total.toFixed(2)}</strong></div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'var(--text)', fontSize: 14 }
