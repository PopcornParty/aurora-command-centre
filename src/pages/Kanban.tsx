import { useState, useEffect } from 'react'
import { loadJSON, saveJSON } from '../lib/storage'

type Card = { id: string; title: string; desc: string; column: string; priority: string; due: string }
type Board = { columns: string[]; cards: Card[] }

const KEY = 'aurora-kanban'
const DEFAULT: Board = { columns: ['To Do', 'Doing', 'Done'], cards: [] }

export default function Kanban() {
  const [board, setBoard] = useState<Board>(() => loadJSON(KEY, DEFAULT))
  const [title, setTitle] = useState('')
  const [col, setCol] = useState(board.columns[0])

  useEffect(() => { saveJSON(KEY, board) }, [board])

  const add = () => {
    if (!title.trim()) return
    setBoard(b => ({ ...b, cards: [{ id: crypto.randomUUID(), title: title.trim(), desc: '', column: col, priority: 'med', due: '' }, ...b.cards] }))
    setTitle('')
  }
  const move = (id: string, to: string) => setBoard(b => ({ ...b, cards: b.cards.map(c => c.id === id ? { ...c, column: to } : c) }))
  const del = (id: string) => { if (confirm('Delete card?')) setBoard(b => ({ ...b, cards: b.cards.filter(c => c.id !== id) })) }

  return (
    <div>
      <h1 className="page-title">Kanban</h1>
      <p className="subtitle">Local board. Move cards with buttons — works on iPhone.</p>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0', flexWrap: 'wrap' }}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Card title" style={{ flex: 1, minWidth: 140, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: 8, color: 'var(--text)' }} />
        <select value={col} onChange={e => setCol(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: 8 }}>
          {board.columns.map(c => <option key={c}>{c}</option>)}
        </select>
        <button className="btn btn-primary" onClick={add}>Add</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {board.columns.map(c => (
          <div key={c} className="panel">
            <h3 style={{ marginBottom: 8 }}>{c} <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>({board.cards.filter(x => x.column === c).length})</span></h3>
            {board.cards.filter(x => x.column === c).map(card => (
              <div key={card.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 8, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{card.title}</strong>
                  <button className="icon-btn" onClick={() => del(card.id)}>×</button>
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                  {board.columns.filter(x => x !== c).map(to => (
                    <button key={to} className="btn" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => move(card.id, to)}>→ {to}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
